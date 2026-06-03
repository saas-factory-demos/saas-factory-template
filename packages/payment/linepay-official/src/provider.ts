import { buildLinePaySignature, verifyLinePaySignature } from './signature.js';

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
 * LINE Pay 官方 v3 API Provider。
 *
 * Lock：ADR-0011 §02-01 列為 stub（v1 等客戶實際需要再串完整 HTTP）。
 * 此處實作介面 + 簽章邏輯，charge / refund 走 fetchImpl 預留位置。
 */
export interface LinePayOfficialConfig {
  channelId: string;
  channelSecret: string;
  env: 'production' | 'sandbox';
  fetchImpl?: typeof fetch;
}

const ENDPOINTS: Record<LinePayOfficialConfig['env'], string> = {
  production: 'https://api-pay.line.me',
  sandbox: 'https://sandbox-api-pay.line.me',
};

const SUPPORTED_METHODS: readonly PaymentMethod[] = ['linepay'];

export class LinePayOfficialProvider implements PaymentProvider {
  readonly name = 'linepay-official' as const;
  readonly supportedMethods = SUPPORTED_METHODS;

  constructor(private readonly config: LinePayOfficialConfig) {}

  async charge(_request: ChargeRequest): Promise<ChargeResult> {
    throw new Error(
      'LinePayOfficial.charge: awaiting credentials (ADR-0011 §02-01 stub)',
    );
  }

  async refund(_request: RefundRequest): Promise<RefundResult> {
    throw new Error(
      'LinePayOfficial.refund: awaiting credentials (ADR-0011 §02-01 stub)',
    );
  }

  async parseWebhook(
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<WebhookEvent> {
    const sig =
      headers['x-line-authorization'] ?? headers['X-LINE-Authorization'];
    const nonce =
      headers['x-line-authorization-nonce'] ??
      headers['X-LINE-Authorization-Nonce'];
    const uri = headers['x-line-uri'] ?? '/payments/notify';
    if (!sig || !nonce) {
      return invalid(rawBody, 'missing LINE Pay headers');
    }
    const valid = verifyLinePaySignature(
      this.config.channelSecret,
      uri,
      rawBody,
      nonce,
      sig,
    );
    if (!valid) {
      return invalid(rawBody, 'signature mismatch');
    }
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch (err) {
      return invalid(rawBody, `invalid JSON: ${String(err)}`);
    }
    return {
      provider: 'linepay-official',
      type: 'charge.paid',
      orderId: String(body.orderId ?? ''),
      providerTradeId: String(body.transactionId ?? ''),
      raw: body,
      signatureValid: true,
      idempotencyKey: `linepay:${String(body.transactionId ?? '')}`,
      occurredAt: new Date().toISOString(),
    };
  }

  /** 公開介面：建構送往 LINE Pay /v3/payments/request 的簽章 + headers（給 apps 端直接用） */
  signRequest(uri: string, body: string, nonce: string): Record<string, string> {
    const sig = buildLinePaySignature(
      this.config.channelSecret,
      uri,
      body,
      nonce,
    );
    return {
      'Content-Type': 'application/json',
      'X-LINE-ChannelId': this.config.channelId,
      'X-LINE-Authorization-Nonce': nonce,
      'X-LINE-Authorization': sig,
      'X-LINE-Endpoint': ENDPOINTS[this.config.env],
    };
  }
}

function invalid(rawBody: string, reason: string): WebhookEvent {
  return {
    provider: 'linepay-official',
    type: 'charge.failed',
    providerTradeId: '',
    raw: { rawBody, reason },
    signatureValid: false,
    idempotencyKey: `linepay:invalid:${Date.now()}`,
    occurredAt: new Date().toISOString(),
    error: reason,
  };
}
