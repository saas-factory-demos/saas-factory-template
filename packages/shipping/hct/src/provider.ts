/**
 * 新竹貨運（HCT）Provider。v1 stub。
 *
 * 新竹貨運官方無公開 API spec，需業務簽約後取得文件。常見規格：
 * - REST + Basic Auth + HMAC-SHA256 over body
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

export interface HctConfig {
  customerId: string;
  username: string;
  password: string;
  signSecret: string;
  env: 'sandbox' | 'production';
  fetchImpl?: typeof fetch;
}

const SUPPORTED: readonly ShippingMethod[] = ['home-delivery'];

export function signHct(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyHctSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = signHct(payload, secret);
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export class HctProvider implements ShippingProvider {
  readonly name = 'hct' as const;
  readonly supportedMethods = SUPPORTED;

  constructor(private readonly config: HctConfig) {}

  async calculateFee(_p: CalculateFeeParams): Promise<number> {
    throw new Error('HCT awaiting credentials (ADR-0011 §02-02 stub)');
  }
  async createShipment(_p: CreateShipmentParams): Promise<ShipmentResult> {
    throw new Error('HCT awaiting credentials (ADR-0011 §02-02 stub)');
  }
  async cancelShipment(_t: string): Promise<void> {
    throw new Error('HCT awaiting credentials (ADR-0011 §02-02 stub)');
  }
  async trackShipment(_t: string): Promise<TrackingInfo> {
    throw new Error('HCT awaiting credentials (ADR-0011 §02-02 stub)');
  }

  async parseWebhook(
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<ShippingWebhookEvent> {
    const sig = headers['x-hct-signature'] ?? headers['X-HCT-Signature'];
    if (!sig) return invalidEvent(rawBody, 'missing X-HCT-Signature');
    if (!verifyHctSignature(rawBody, sig, this.config.signSecret)) {
      return invalidEvent(rawBody, 'signature mismatch');
    }
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return invalidEvent(rawBody, 'invalid JSON');
    }
    return {
      provider: 'hct',
      trackingNumber: String(body.trackingNumber ?? ''),
      orderId: body.orderId ? String(body.orderId) : undefined,
      status: mapStatus(String(body.status ?? '')),
      occurredAt: String(body.occurredAt ?? new Date().toISOString()),
      raw: body,
      signatureValid: true,
    };
  }
}

function mapStatus(s: string): ShippingWebhookEvent['status'] {
  const m: Record<string, ShippingWebhookEvent['status']> = {
    pending: 'pending',
    shipping: 'in-transit',
    delivered: 'delivered',
    returned: 'returned',
    cancelled: 'cancelled',
  };
  return m[s] ?? 'pending';
}

function invalidEvent(rawBody: string, reason: string): ShippingWebhookEvent {
  return {
    provider: 'hct',
    trackingNumber: '',
    status: 'pending',
    occurredAt: new Date().toISOString(),
    raw: { rawBody, reason },
    signatureValid: false,
    error: reason,
  };
}
