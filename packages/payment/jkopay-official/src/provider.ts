import { createHmac, timingSafeEqual } from 'node:crypto';

/** webhook 時間戳容許窗口（毫秒），預設 5 分鐘。 */
const WEBHOOK_TOLERANCE_MS = 5 * 60 * 1000;

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
 * 街口支付官方 OpenAPI Provider。
 *
 * 簽章方式（街口 OpenAPI v3）：
 *   HMAC-SHA256(`${api-key}${nonce}${timestamp}${body}`, secret) → hex
 *   header： X-JKO-ApiKey / X-JKO-Nonce / X-JKO-Timestamp / X-JKO-Signature
 *
 * Lock：ADR-0011 §02-01 列為 stub。
 */
export interface JkoPayOfficialConfig {
  apiKey: string;
  secret: string;
  env: 'production' | 'sandbox';
}

const SUPPORTED_METHODS: readonly PaymentMethod[] = ['jkopay'];

export function buildJkoSignature(
  apiKey: string,
  secret: string,
  nonce: string,
  timestamp: string,
  body: string,
): string {
  return createHmac('sha256', secret)
    .update(`${apiKey}${nonce}${timestamp}${body}`)
    .digest('hex');
}

export class JkoPayOfficialProvider implements PaymentProvider {
  readonly name = 'jkopay-official' as const;
  readonly supportedMethods = SUPPORTED_METHODS;

  constructor(private readonly config: JkoPayOfficialConfig) {}

  async charge(_request: ChargeRequest): Promise<ChargeResult> {
    throw new Error(
      'JkoPayOfficial.charge: awaiting credentials (ADR-0011 §02-01 stub)',
    );
  }

  async refund(_request: RefundRequest): Promise<RefundResult> {
    throw new Error(
      'JkoPayOfficial.refund: awaiting credentials (ADR-0011 §02-01 stub)',
    );
  }

  async parseWebhook(
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<WebhookEvent> {
    const sig = headers['x-jko-signature'];
    const nonce = headers['x-jko-nonce'];
    const ts = headers['x-jko-timestamp'];
    const apiKey = headers['x-jko-apikey'];
    if (!sig || !nonce || !ts || !apiKey) {
      return invalid(rawBody, 'missing JKO headers');
    }
    // 防 replay：拒絕超過容許窗口的時間戳（ts 為毫秒字串）
    const tsMs = Number(ts);
    if (!Number.isFinite(tsMs)) {
      return invalid(rawBody, 'invalid timestamp');
    }
    if (Math.abs(Date.now() - tsMs) > WEBHOOK_TOLERANCE_MS) {
      return invalid(rawBody, 'timestamp outside tolerance window');
    }
    const expected = buildJkoSignature(
      this.config.apiKey,
      this.config.secret,
      nonce,
      ts,
      rawBody,
    );
    const expectedBuf = Buffer.from(expected, 'utf8');
    const sigBuf = Buffer.from(sig, 'utf8');
    if (
      expectedBuf.length !== sigBuf.length ||
      !timingSafeEqual(expectedBuf, sigBuf)
    ) {
      return invalid(rawBody, 'signature mismatch');
    }
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch (err) {
      return invalid(rawBody, `invalid JSON: ${String(err)}`);
    }
    return {
      provider: 'jkopay-official',
      type: 'charge.paid',
      orderId: String(body.merchantTradeNo ?? ''),
      providerTradeId: String(body.platformTradeNo ?? ''),
      raw: body,
      signatureValid: true,
      idempotencyKey: `jko:${String(body.platformTradeNo ?? '')}`,
      occurredAt: new Date().toISOString(),
    };
  }
}

function invalid(rawBody: string, reason: string): WebhookEvent {
  return {
    provider: 'jkopay-official',
    type: 'charge.failed',
    providerTradeId: '',
    raw: { rawBody, reason },
    signatureValid: false,
    idempotencyKey: `jko:invalid:${Date.now()}`,
    occurredAt: new Date().toISOString(),
    error: reason,
  };
}
