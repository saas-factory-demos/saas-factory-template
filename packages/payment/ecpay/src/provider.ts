import { buildCheckMacValue, verifyCheckMacValue } from './check-mac.js';
import { methodToEcpayChoosePayment } from './method-map.js';

import type {
  ChargeRequest,
  ChargeResult,
  PaymentMethod,
  PaymentProvider,
  RefundRequest,
  RefundResult,
  WebhookEvent,
} from '@saas-factory/payment-core';

export interface EcpayConfig {
  merchantId: string;
  hashKey: string;
  hashIv: string;
  env: 'production' | 'sandbox';
  fetchImpl?: typeof fetch;
}

const ENDPOINTS: Record<EcpayConfig['env'], { aio: string; refund: string }> = {
  production: {
    aio: 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5',
    refund: 'https://payment.ecpay.com.tw/CreditDetail/DoAction',
  },
  sandbox: {
    aio: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
    refund: 'https://payment-stage.ecpay.com.tw/CreditDetail/DoAction',
  },
};

const SUPPORTED_METHODS: readonly PaymentMethod[] = [
  'credit',
  'credit-installment',
  'atm',
  'cvs',
  'cvs-barcode',
  'webatm',
  'applepay',
  'googlepay',
  'taiwanpay',
];

const TWO_DIGITS = (n: number): string => String(n).padStart(2, '0');

function formatEcpayDate(d: Date): string {
  return `${d.getFullYear()}/${TWO_DIGITS(d.getMonth() + 1)}/${TWO_DIGITS(d.getDate())} ${TWO_DIGITS(d.getHours())}:${TWO_DIGITS(d.getMinutes())}:${TWO_DIGITS(d.getSeconds())}`;
}

export class EcpayProvider implements PaymentProvider {
  readonly name = 'ecpay' as const;
  readonly supportedMethods = SUPPORTED_METHODS;

  constructor(private readonly config: EcpayConfig) {}

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    if (request.amount.currency !== 'TWD') {
      throw new Error('ECPay only supports TWD');
    }
    const params: Record<string, string | number> = {
      MerchantID: this.config.merchantId,
      MerchantTradeNo: request.orderId,
      MerchantTradeDate: formatEcpayDate(new Date()),
      PaymentType: 'aio',
      TotalAmount: request.amount.amount,
      TradeDesc: request.description ?? request.orderId,
      ItemName: request.description ?? request.orderId,
      ReturnURL: request.notifyUrl ?? '',
      ChoosePayment: methodToEcpayChoosePayment(request.method),
      EncryptType: 1,
    };
    if (request.returnUrl) params.OrderResultURL = request.returnUrl;
    if (request.cancelUrl) params.ClientBackURL = request.cancelUrl;
    if (request.method === 'credit-installment' && request.installment) {
      params.CreditInstallment = request.installment;
    }
    const mac = buildCheckMacValue(
      params,
      this.config.hashKey,
      this.config.hashIv,
    );
    return {
      orderId: request.orderId,
      providerTradeId: '',
      provider: 'ecpay',
      method: request.method,
      status: 'pending',
      amount: request.amount,
      redirectUrl: ENDPOINTS[this.config.env].aio,
      raw: { ...params, CheckMacValue: mac },
    };
  }

  async refund(request: RefundRequest): Promise<RefundResult> {
    if (!request.amount) {
      throw new Error('ECPay refund 必須帶 amount');
    }
    const params: Record<string, string | number> = {
      MerchantID: this.config.merchantId,
      MerchantTradeNo: request.orderId,
      TradeNo: request.providerTradeId,
      Action: 'R',
      TotalAmount: request.amount.amount,
    };
    const mac = buildCheckMacValue(
      params,
      this.config.hashKey,
      this.config.hashIv,
    );
    const body = new URLSearchParams({
      ...Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ),
      CheckMacValue: mac,
    });
    const fetchImpl = this.config.fetchImpl ?? fetch;
    const res = await fetchImpl(ENDPOINTS[this.config.env].refund, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const text = await res.text();
    // ECPay refund 回 query string 格式 RtnCode=1&...
    const parsed: Record<string, string> = {};
    for (const pair of text.split('&')) {
      const [k, v] = pair.split('=');
      if (k) parsed[k] = decodeURIComponent(v ?? '');
    }
    const success = parsed.RtnCode === '1';
    return {
      orderId: request.orderId,
      providerTradeId: request.providerTradeId,
      refundId: success ? request.providerTradeId : '',
      amount: request.amount,
      status: success ? 'refunded' : 'failed',
      raw: parsed,
    };
  }

  async parseWebhook(
    rawBody: string,
    _headers: Record<string, string>,
  ): Promise<WebhookEvent> {
    const params: Record<string, string> = {};
    for (const pair of rawBody.split('&')) {
      if (!pair) continue;
      const idx = pair.indexOf('=');
      if (idx === -1) continue;
      const key = decodeURIComponent(pair.slice(0, idx));
      const value = decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, ' '));
      params[key] = value;
    }
    const mac = params.CheckMacValue;
    if (!mac) {
      return makeInvalidEvent(rawBody, 'missing CheckMacValue');
    }
    const valid = verifyCheckMacValue(
      params,
      mac,
      this.config.hashKey,
      this.config.hashIv,
    );
    if (!valid) {
      return makeInvalidEvent(rawBody, 'CheckMacValue mismatch');
    }
    // 確認回呼確為本店家，避免共用 HashKey 場景下被混淆代理
    if (params.MerchantID && params.MerchantID !== this.config.merchantId) {
      return makeInvalidEvent(rawBody, 'MerchantID mismatch');
    }
    // 防 replay：PaymentDate 格式 `yyyy/MM/dd HH:mm:ss`（台北時區）
    const paymentDate = params.PaymentDate ?? params.TradeDate;
    if (paymentDate) {
      const paidMs = parseEcpayDate(paymentDate);
      if (paidMs == null) {
        return makeInvalidEvent(rawBody, `invalid PaymentDate: ${paymentDate}`);
      }
      if (Math.abs(Date.now() - paidMs) > WEBHOOK_TOLERANCE_MS) {
        return makeInvalidEvent(rawBody, 'PaymentDate outside tolerance window');
      }
    }
    const success = params.RtnCode === '1';
    const amt = Number(params.TradeAmt ?? 0);
    return {
      provider: 'ecpay',
      type: success ? 'charge.paid' : 'charge.failed',
      orderId: params.MerchantTradeNo ?? '',
      providerTradeId: params.TradeNo ?? '',
      amount: amt ? { amount: amt, currency: 'TWD' } : undefined,
      error: success ? undefined : params.RtnMsg,
      raw: params,
      signatureValid: true,
      idempotencyKey: `ecpay:${params.TradeNo ?? ''}`,
      occurredAt: new Date().toISOString(),
    };
  }
}

/** webhook 時間戳容許窗口（毫秒），預設 5 分鐘。 */
const WEBHOOK_TOLERANCE_MS = 5 * 60 * 1000;

/**
 * 解析綠界回呼日期（`yyyy/MM/dd HH:mm:ss`，台北時區 UTC+8）為 epoch ms。
 * 解析失敗回傳 null。
 */
function parseEcpayDate(date: string): number | null {
  const m = /^(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(date);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  const utcMs = Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(s),
  );
  return utcMs - 8 * 60 * 60 * 1000;
}

function makeInvalidEvent(rawBody: string, reason: string): WebhookEvent {
  return {
    provider: 'ecpay',
    type: 'charge.failed',
    providerTradeId: '',
    raw: { rawBody, reason },
    signatureValid: false,
    idempotencyKey: `ecpay:invalid:${Date.now()}`,
    occurredAt: new Date().toISOString(),
    error: reason,
  };
}
