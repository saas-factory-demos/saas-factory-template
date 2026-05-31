/**
 * 國際快遞 Provider（EMS / DHL / FedEx 統一介面）。v1 stub。
 *
 * 三家 API：
 * - DHL Express MyDHL API（OAuth2 + JSON）
 * - FedEx Web Services（OAuth2 + JSON）
 * - 中華郵政 EMS（同 post，但走國際端點）
 *
 * 真實串接時，依 `carrier` 動態選擇底層 client。本 stub 保留統一介面。
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

/** 國際物流商。 */
export type InternationalCarrier = 'dhl' | 'fedex' | 'ems';

export interface InternationalConfig {
  carrier: InternationalCarrier;
  /** OAuth2 client credentials（DHL / FedEx） */
  clientId?: string;
  clientSecret?: string;
  /** EMS API key（中華郵政） */
  apiKey?: string;
  /** Webhook 簽章密鑰 */
  signSecret: string;
  env: 'sandbox' | 'production';
  fetchImpl?: typeof fetch;
}

const SUPPORTED: readonly ShippingMethod[] = ['international-express'];

export function signInternational(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyInternationalSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = signInternational(payload, secret);
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export class InternationalProvider implements ShippingProvider {
  readonly name = 'international' as const;
  readonly supportedMethods = SUPPORTED;

  constructor(private readonly config: InternationalConfig) {}

  async calculateFee(_p: CalculateFeeParams): Promise<number> {
    throw new Error(
      `${this.config.carrier} international awaiting credentials (ADR-0011 §02-02 stub)`,
    );
  }
  async createShipment(_p: CreateShipmentParams): Promise<ShipmentResult> {
    throw new Error(
      `${this.config.carrier} international awaiting credentials (ADR-0011 §02-02 stub)`,
    );
  }
  async cancelShipment(_t: string): Promise<void> {
    throw new Error(
      `${this.config.carrier} international awaiting credentials (ADR-0011 §02-02 stub)`,
    );
  }
  async trackShipment(_t: string): Promise<TrackingInfo> {
    throw new Error(
      `${this.config.carrier} international awaiting credentials (ADR-0011 §02-02 stub)`,
    );
  }

  async parseWebhook(
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<ShippingWebhookEvent> {
    const sig =
      headers['x-shipping-signature'] ?? headers['X-Shipping-Signature'];
    if (!sig) return invalid(rawBody, 'missing X-Shipping-Signature');
    if (
      !verifyInternationalSignature(rawBody, sig, this.config.signSecret)
    ) {
      return invalid(rawBody, 'signature mismatch');
    }
    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return invalid(rawBody, 'invalid JSON');
    }
    return {
      provider: 'international',
      trackingNumber: String(body.trackingNumber ?? ''),
      orderId: body.orderId ? String(body.orderId) : undefined,
      status: mapStatus(String(body.status ?? '')),
      occurredAt: String(body.occurredAt ?? new Date().toISOString()),
      raw: { carrier: this.config.carrier, ...body },
      signatureValid: true,
    };
  }
}

function mapStatus(s: string): ShippingWebhookEvent['status'] {
  const m: Record<string, ShippingWebhookEvent['status']> = {
    pre_transit: 'pending',
    in_transit: 'in-transit',
    out_for_delivery: 'arrived',
    delivered: 'delivered',
    returned: 'returned',
    cancelled: 'cancelled',
  };
  return m[s.toLowerCase()] ?? 'pending';
}

function invalid(rawBody: string, reason: string): ShippingWebhookEvent {
  return {
    provider: 'international',
    trackingNumber: '',
    status: 'pending',
    occurredAt: new Date().toISOString(),
    raw: { rawBody, reason },
    signatureValid: false,
    error: reason,
  };
}
