import {
  aesDecrypt,
  aesEncrypt,
  buildTradeSha,
  fromQueryString,
  toQueryString,
  verifyTradeSha,
} from './crypto.js';
import { methodToNewebFlags } from './method-map.js';

import type {
  ChargeRequest,
  ChargeResult,
  PaymentMethod,
  PaymentProvider,
  RefundRequest,
  RefundResult,
  SubscriptionRequest,
  SubscriptionResult,
  WebhookEvent,
} from '@saas-factory/payment-core';

/**
 * 藍新環境配置。
 *
 * 取得方式：商店後台 → 商店資料設定 → MerchantID / HashKey / HashIV
 */
export interface NewebPayConfig {
  merchantId: string;
  hashKey: string;
  hashIv: string;
  /** 'production' | 'sandbox'：對應不同端點 */
  env: 'production' | 'sandbox';
  /** API 版本（藍新 MPG 預設 2.0） */
  version?: string;
  /** 注入 fetch（用於測試） */
  fetchImpl?: typeof fetch;
}

/** webhook 時間戳容許窗口（毫秒），預設 5 分鐘。 */
const WEBHOOK_TOLERANCE_MS = 5 * 60 * 1000;

const ENDPOINTS: Record<NewebPayConfig['env'], { mpg: string; api: string }> = {
  production: {
    mpg: 'https://core.newebpay.com/MPG/mpg_gateway',
    api: 'https://core.newebpay.com/API',
  },
  sandbox: {
    mpg: 'https://ccore.newebpay.com/MPG/mpg_gateway',
    api: 'https://ccore.newebpay.com/API',
  },
};

const SUPPORTED_METHODS: readonly PaymentMethod[] = [
  'credit',
  'credit-installment',
  'atm',
  'cvs',
  'cvs-barcode',
  'webatm',
  'linepay',
  'jkopay',
  'applepay',
  'googlepay',
  'samsungpay',
  'pi-wallet',
  'easycard',
  'esun-wallet',
  'taiwanpay',
];

/**
 * 藍新金流 Provider。
 *
 * 因藍新 MPG 為「server 產 HTML form → browser 自動 POST 跳轉」模式，
 * `charge()` 不直接打 HTTP，而是回傳已加密的 TradeInfo + TradeSha + endpoint，
 * 由 apps 端組成 form / redirectUrl（hosted）。
 */
export class NewebPayProvider implements PaymentProvider {
  readonly name = 'newebpay' as const;
  readonly supportedMethods = SUPPORTED_METHODS;

  constructor(private readonly config: NewebPayConfig) {
    if (config.hashKey.length !== 32 || config.hashIv.length !== 16) {
      throw new Error('NewebPay config: HashKey 32 chars + HashIV 16 chars 必填');
    }
  }

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    if (request.amount.currency !== 'TWD') {
      throw new Error('NewebPay only supports TWD');
    }
    const flags = methodToNewebFlags(request.method);
    const tradeInfoObj: Record<string, string | number> = {
      MerchantID: this.config.merchantId,
      RespondType: 'JSON',
      TimeStamp: Math.floor(Date.now() / 1000),
      Version: this.config.version ?? '2.0',
      MerchantOrderNo: request.orderId,
      Amt: request.amount.amount,
      ItemDesc: request.description ?? request.orderId,
      Email: request.buyer?.email ?? '',
      LoginType: 0,
      ...flags,
    };
    if (request.returnUrl) tradeInfoObj.ReturnURL = request.returnUrl;
    if (request.notifyUrl) tradeInfoObj.NotifyURL = request.notifyUrl;
    if (request.cancelUrl) tradeInfoObj.ClientBackURL = request.cancelUrl;

    const tradeInfoQs = toQueryString(tradeInfoObj);
    const tradeInfo = aesEncrypt(
      tradeInfoQs,
      this.config.hashKey,
      this.config.hashIv,
    );
    const tradeSha = buildTradeSha(
      tradeInfo,
      this.config.hashKey,
      this.config.hashIv,
    );
    return {
      orderId: request.orderId,
      providerTradeId: '',
      provider: 'newebpay',
      method: request.method,
      status: 'pending',
      amount: request.amount,
      redirectUrl: ENDPOINTS[this.config.env].mpg,
      raw: {
        MerchantID: this.config.merchantId,
        TradeInfo: tradeInfo,
        TradeSha: tradeSha,
        Version: this.config.version ?? '2.0',
      },
    };
  }

  async refund(request: RefundRequest): Promise<RefundResult> {
    if (!request.amount) {
      throw new Error('NewebPay refund 必須帶 amount（全額或部分）');
    }
    const apiPayload = {
      RespondType: 'JSON',
      Version: '1.0',
      Amt: request.amount.amount,
      MerchantOrderNo: request.orderId,
      TimeStamp: Math.floor(Date.now() / 1000),
      IndexType: 1,
      CloseType: 2, // 2 = 退款
    };
    const tradeInfo = aesEncrypt(
      toQueryString(apiPayload),
      this.config.hashKey,
      this.config.hashIv,
    );
    const url = `${ENDPOINTS[this.config.env].api}/CreditCard/Close`;
    const body = new URLSearchParams({
      MerchantID_: this.config.merchantId,
      PostData_: tradeInfo,
    });
    const fetchImpl = this.config.fetchImpl ?? fetch;
    const res = await fetchImpl(url, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const json = (await res.json()) as {
      Status?: string;
      Message?: string;
      Result?: { MerchantOrderNo?: string; TradeNo?: string };
    };
    if (json.Status !== 'SUCCESS') {
      return {
        orderId: request.orderId,
        providerTradeId: request.providerTradeId,
        refundId: '',
        amount: request.amount,
        status: 'failed',
        raw: json,
      };
    }
    return {
      orderId: request.orderId,
      providerTradeId: request.providerTradeId,
      refundId: json.Result?.TradeNo ?? '',
      amount: request.amount,
      status: 'refunded',
      raw: json,
    };
  }

  async createSubscription(
    request: SubscriptionRequest,
  ): Promise<SubscriptionResult> {
    if (request.method !== 'credit') {
      throw new Error('NewebPay subscription only supports credit method');
    }
    const periodTypeMap = {
      day: 'D',
      week: 'W',
      month: 'M',
      year: 'Y',
    } as const;
    const params: Record<string, string | number> = {
      RespondType: 'JSON',
      TimeStamp: Math.floor(Date.now() / 1000),
      Version: '1.5',
      MerchantOrderNo: request.orderId,
      ProdDesc: request.orderId,
      PeriodAmt: request.amount.amount,
      PeriodType: periodTypeMap[request.interval],
      PeriodPoint: '01',
      PeriodStartType: request.startImmediately ? 1 : 2,
      PeriodTimes: 99,
      PayerEmail: request.buyer?.email ?? '',
    };
    if (request.notifyUrl) params.NotifyURL = request.notifyUrl;
    if (request.returnUrl) params.ReturnURL = request.returnUrl;
    const tradeInfo = aesEncrypt(
      toQueryString(params),
      this.config.hashKey,
      this.config.hashIv,
    );
    const tradeSha = buildTradeSha(
      tradeInfo,
      this.config.hashKey,
      this.config.hashIv,
    );
    return {
      orderId: request.orderId,
      providerTradeId: '',
      provider: 'newebpay',
      subscriptionId: request.orderId,
      status: 'active',
      redirectUrl: `${ENDPOINTS[this.config.env].mpg.replace('/mpg_gateway', '')}/Period`,
      raw: {
        MerchantID_: this.config.merchantId,
        PostData_: tradeInfo,
        TradeSha: tradeSha,
      },
    };
  }

  async parseWebhook(
    rawBody: string,
    _headers: Record<string, string>,
  ): Promise<WebhookEvent> {
    // 藍新 callback 是 form-urlencoded：TradeInfo + TradeSha
    const body = fromQueryString(rawBody);
    const tradeInfo = body.TradeInfo;
    const tradeSha = body.TradeSha;
    if (!tradeInfo || !tradeSha) {
      return invalidSignatureEvent(rawBody, 'missing TradeInfo / TradeSha');
    }
    const valid = verifyTradeSha(
      tradeInfo,
      tradeSha,
      this.config.hashKey,
      this.config.hashIv,
    );
    if (!valid) {
      return invalidSignatureEvent(rawBody, 'TradeSha mismatch');
    }
    let decoded: Record<string, unknown> = {};
    try {
      const decrypted = aesDecrypt(
        tradeInfo,
        this.config.hashKey,
        this.config.hashIv,
      );
      decoded = JSON.parse(decrypted) as Record<string, unknown>;
    } catch (err) {
      return invalidSignatureEvent(rawBody, `decrypt failed: ${String(err)}`);
    }
    const result = (decoded.Result ?? {}) as Record<string, unknown>;
    // B6：confirm 此回呼確為本店家 MerchantID，避免共用 HashKey 場景下被混淆代理。
    const merchantIdInBody = result.MerchantID;
    if (
      typeof merchantIdInBody === 'string' &&
      merchantIdInBody !== this.config.merchantId
    ) {
      return invalidSignatureEvent(rawBody, 'MerchantID mismatch');
    }
    // B4：防 replay。PayTime 格式為 `yyyy-MM-dd HH:mm:ss`（藍新台北時區）；
    // 若有提供且偏離 now 超過容許窗口則拒絕。
    const payTimeRaw = result.PayTime;
    if (typeof payTimeRaw === 'string' && payTimeRaw.length > 0) {
      const payTimeMs = parseNewebPayTime(payTimeRaw);
      if (payTimeMs == null) {
        return invalidSignatureEvent(rawBody, `invalid PayTime: ${payTimeRaw}`);
      }
      if (Math.abs(Date.now() - payTimeMs) > WEBHOOK_TOLERANCE_MS) {
        return invalidSignatureEvent(rawBody, 'PayTime outside tolerance window');
      }
    }
    const orderId = String(result.MerchantOrderNo ?? '');
    const providerTradeId = String(result.TradeNo ?? '');
    const amtRaw = result.Amt;
    const amt =
      typeof amtRaw === 'number'
        ? amtRaw
        : typeof amtRaw === 'string'
          ? Number(amtRaw)
          : 0;
    const success = decoded.Status === 'SUCCESS';
    return {
      provider: 'newebpay',
      type: success ? 'charge.paid' : 'charge.failed',
      orderId,
      providerTradeId,
      amount: amt ? { amount: amt, currency: 'TWD' } : undefined,
      error: success ? undefined : String(decoded.Message ?? 'unknown'),
      raw: decoded,
      signatureValid: true,
      idempotencyKey: `newebpay:${providerTradeId}`,
      occurredAt: new Date().toISOString(),
    };
  }
}

/**
 * 解析藍新 PayTime（`yyyy-MM-dd HH:mm:ss`，台北時區 UTC+8）為 epoch ms。
 * 解析失敗回傳 null。
 */
function parseNewebPayTime(payTime: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(payTime);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  // 台北時區 UTC+8：直接用 Date.UTC 後減 8 小時對應 epoch
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

function invalidSignatureEvent(rawBody: string, reason: string): WebhookEvent {
  return {
    provider: 'newebpay',
    type: 'charge.failed',
    providerTradeId: '',
    raw: { rawBody, reason },
    signatureValid: false,
    idempotencyKey: `newebpay:invalid:${Date.now()}`,
    occurredAt: new Date().toISOString(),
    error: reason,
  };
}
