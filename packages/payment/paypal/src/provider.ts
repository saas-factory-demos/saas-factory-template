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
 * PayPal Checkout（hosted）Provider。
 *
 * PayPal webhook 驗簽走 `Verify Webhook Signature` API（POST 到 PayPal 反向驗證）。
 * v1 為 stub，自家簽章邏輯複雜（含 CRC32 + cert chain），先用 PayPal 提供的 verify endpoint。
 *
 * Lock：ADR-0011 §02-01 v1 stub。
 */
export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  webhookId: string;
  env: 'production' | 'sandbox';
  fetchImpl?: typeof fetch;
}

const SUPPORTED_METHODS: readonly PaymentMethod[] = ['paypal'];

export class PayPalProvider implements PaymentProvider {
  readonly name = 'paypal' as const;
  readonly supportedMethods = SUPPORTED_METHODS;

  constructor(private readonly config: PayPalConfig) {}

  async charge(_request: ChargeRequest): Promise<ChargeResult> {
    throw new Error(
      'PayPal.charge: awaiting credentials (ADR-0011 §02-01 stub)',
    );
  }

  async refund(_request: RefundRequest): Promise<RefundResult> {
    throw new Error(
      'PayPal.refund: awaiting credentials (ADR-0011 §02-01 stub)',
    );
  }

  async parseWebhook(
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<WebhookEvent> {
    const required = [
      'paypal-auth-algo',
      'paypal-cert-url',
      'paypal-transmission-id',
      'paypal-transmission-sig',
      'paypal-transmission-time',
    ];
    for (const k of required) {
      if (!headers[k]) {
        return invalid(rawBody, `missing header: ${k}`);
      }
    }
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch (err) {
      return invalid(rawBody, `invalid JSON: ${String(err)}`);
    }
    // 完整驗簽需呼叫 PayPal /v1/notifications/verify-webhook-signature
    // v1 stub：標記為待驗證（apps 端應自行呼叫該 API 後再 consume）
    const eventType = String(body.event_type ?? '');
    const resource = (body.resource ?? {}) as Record<string, unknown>;
    return {
      provider: 'paypal',
      type: eventType.includes('COMPLETED') ? 'charge.paid' : 'charge.failed',
      orderId: String(resource.custom_id ?? resource.invoice_id ?? ''),
      providerTradeId: String(resource.id ?? ''),
      raw: body,
      // 簽章未真正驗證（stub），但 header 齊全，標 false 提醒上層處理
      signatureValid: false,
      idempotencyKey: `paypal:${String(body.id ?? '')}`,
      occurredAt: new Date().toISOString(),
      error: 'PayPal signature verification not implemented (stub)',
    };
  }
}

function invalid(rawBody: string, reason: string): WebhookEvent {
  return {
    provider: 'paypal',
    type: 'charge.failed',
    providerTradeId: '',
    raw: { rawBody, reason },
    signatureValid: false,
    idempotencyKey: `paypal:invalid:${Date.now()}`,
    occurredAt: new Date().toISOString(),
    error: reason,
  };
}
