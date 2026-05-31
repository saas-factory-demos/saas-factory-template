import type {
  ChargeRequest,
  ChargeResult,
  PaymentMethod,
  PaymentProvider,
  RefundRequest,
  RefundResult,
  WebhookEvent,
} from '@saas-factory/payment-core';

/**
 * TapPay Provider（iframe 嵌入式信用卡欄位 + 訂閱）。
 *
 * TapPay 不用簽章，靠 partner_key + merchant_id 作為 server-to-server 認證。
 * Webhook 透過 IP 白名單而非簽章（這是 TapPay 規格限制）。
 *
 * Lock：ADR-0011 §02-01 v1 stub。
 */
export interface TapPayConfig {
  partnerKey: string;
  merchantId: string;
  env: 'production' | 'sandbox';
  /** TapPay 官方 webhook 來源 IP 白名單 */
  allowedIps?: string[];
  fetchImpl?: typeof fetch;
}

const SUPPORTED_METHODS: readonly PaymentMethod[] = ['credit'];

export class TapPayProvider implements PaymentProvider {
  readonly name = 'tappay' as const;
  readonly supportedMethods = SUPPORTED_METHODS;

  constructor(private readonly config: TapPayConfig) {}

  async charge(_request: ChargeRequest): Promise<ChargeResult> {
    throw new Error(
      'TapPay.charge: awaiting credentials (ADR-0011 §02-01 stub)',
    );
  }

  async refund(_request: RefundRequest): Promise<RefundResult> {
    throw new Error(
      'TapPay.refund: awaiting credentials (ADR-0011 §02-01 stub)',
    );
  }

  async parseWebhook(
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<WebhookEvent> {
    // TapPay 用 IP 白名單而非簽章；caller 應在 router 外側檢查 source IP
    const sourceIp = headers['x-forwarded-for'] ?? headers['x-real-ip'] ?? '';
    if (
      this.config.allowedIps &&
      this.config.allowedIps.length > 0 &&
      !this.config.allowedIps.includes(sourceIp)
    ) {
      return invalid(rawBody, `disallowed source IP: ${sourceIp}`);
    }
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch (err) {
      return invalid(rawBody, `invalid JSON: ${String(err)}`);
    }
    const success = body.status === 0;
    return {
      provider: 'tappay',
      type: success ? 'charge.paid' : 'charge.failed',
      orderId: String(body.order_number ?? ''),
      providerTradeId: String(body.rec_trade_id ?? ''),
      raw: body,
      signatureValid: true,
      idempotencyKey: `tappay:${String(body.rec_trade_id ?? '')}`,
      occurredAt: new Date().toISOString(),
    };
  }
}

function invalid(rawBody: string, reason: string): WebhookEvent {
  return {
    provider: 'tappay',
    type: 'charge.failed',
    providerTradeId: '',
    raw: { rawBody, reason },
    signatureValid: false,
    idempotencyKey: `tappay:invalid:${Date.now()}`,
    occurredAt: new Date().toISOString(),
    error: reason,
  };
}
