/**
 * 黑貓宅配 Provider（T-cat）。
 *
 * 黑貓有兩種介接：
 * 1. EDI 檔案交換（傳統大客戶）
 * 2. API（新系統）
 *
 * 兩種都需業務簽約後才有 credentials。v1 stub：保留介面、實作 HMAC 簽章 helper、
 * webhook 解析。實際 charge / track 等 HTTP 呼叫 throw 'awaiting credentials'。
 *
 * Lock：ADR-0011 §02-02 v1 stub。
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

import type {
  CalculateFeeParams,
  CreateShipmentParams,
  ShipmentResult,
  ShippingMethod,
  ShippingProvider,
  ShippingWebhookEvent,
  TrackingInfo,
} from '@saas-factory/shipping-core';

export interface BlackcatConfig {
  customerId: string;
  apiKey: string;
  /** HMAC-SHA256 簽章密鑰 */
  signSecret: string;
  env: 'sandbox' | 'production';
  fetchImpl?: typeof fetch;
}

const SUPPORTED: readonly ShippingMethod[] = ['home-delivery'];

/** HMAC-SHA256 hex（黑貓 API 簽章規格）。 */
export function signBlackcat(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/** Constant-time 驗章（避免 timing attack）。 */
export function verifyBlackcatSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = signBlackcat(payload, secret);
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export class BlackcatProvider implements ShippingProvider {
  readonly name = 'blackcat' as const;
  readonly supportedMethods = SUPPORTED;

  constructor(private readonly config: BlackcatConfig) {}

  async calculateFee(_params: CalculateFeeParams): Promise<number> {
    throw new Error('Blackcat awaiting credentials (ADR-0011 §02-02 stub)');
  }

  async createShipment(
    _params: CreateShipmentParams,
  ): Promise<ShipmentResult> {
    throw new Error('Blackcat awaiting credentials (ADR-0011 §02-02 stub)');
  }

  async cancelShipment(_trackingNumber: string): Promise<void> {
    throw new Error('Blackcat awaiting credentials (ADR-0011 §02-02 stub)');
  }

  async trackShipment(_trackingNumber: string): Promise<TrackingInfo> {
    throw new Error('Blackcat awaiting credentials (ADR-0011 §02-02 stub)');
  }

  async parseWebhook(
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<ShippingWebhookEvent> {
    const sig = headers['x-blackcat-signature'] ?? headers['X-Blackcat-Signature'];
    if (!sig) {
      return invalidEvent('blackcat', rawBody, 'missing X-Blackcat-Signature');
    }
    const valid = verifyBlackcatSignature(rawBody, sig, this.config.signSecret);
    if (!valid) return invalidEvent('blackcat', rawBody, 'signature mismatch');
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return invalidEvent('blackcat', rawBody, 'invalid JSON');
    }
    return {
      provider: 'blackcat',
      trackingNumber: String(body.trackingNumber ?? ''),
      orderId: body.orderId ? String(body.orderId) : undefined,
      status: mapBlackcatStatus(String(body.status ?? '')),
      occurredAt: String(body.occurredAt ?? new Date().toISOString()),
      raw: body,
      signatureValid: true,
    };
  }
}

function mapBlackcatStatus(s: string): ShipmentWebhookStatus {
  const m: Record<string, ShipmentWebhookStatus> = {
    pending: 'pending',
    in_transit: 'in-transit',
    delivered: 'delivered',
    returned: 'returned',
    cancelled: 'cancelled',
  };
  return m[s] ?? 'pending';
}

type ShipmentWebhookStatus = ShippingWebhookEvent['status'];

function invalidEvent(
  provider: ShippingProvider['name'],
  rawBody: string,
  reason: string,
): ShippingWebhookEvent {
  return {
    provider,
    trackingNumber: '',
    status: 'pending',
    occurredAt: new Date().toISOString(),
    raw: { rawBody, reason },
    signatureValid: false,
    error: reason,
  };
}
