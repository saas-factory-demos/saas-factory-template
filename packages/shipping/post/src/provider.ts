/**
 * 中華郵政 i 郵箱 Provider。v1 stub。
 *
 * 中華郵政 OpenAPI 採 Bearer Token + HMAC-SHA256 over `${method}${path}${timestamp}${body}` 形式。
 * v1 stub：保留簽章 helper + webhook 解析；charge/track throw 'awaiting credentials'。
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

export interface PostConfig {
  merchantId: string;
  apiKey: string;
  signSecret: string;
  env: 'sandbox' | 'production';
  fetchImpl?: typeof fetch;
}

const SUPPORTED: readonly ShippingMethod[] = ['post-locker', 'home-delivery'];

/** 中華郵政簽章：HMAC-SHA256(method + path + timestamp + body, secret) → hex。 */
export function signPost(
  method: string,
  path: string,
  timestamp: string,
  body: string,
  secret: string,
): string {
  return createHmac('sha256', secret)
    .update(`${method}${path}${timestamp}${body}`)
    .digest('hex');
}

export function verifyPostSignature(
  method: string,
  path: string,
  timestamp: string,
  body: string,
  signature: string,
  secret: string,
): boolean {
  const expected = signPost(method, path, timestamp, body, secret);
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export class PostProvider implements ShippingProvider {
  readonly name = 'post' as const;
  readonly supportedMethods = SUPPORTED;

  constructor(private readonly config: PostConfig) {}

  async calculateFee(_p: CalculateFeeParams): Promise<number> {
    throw new Error('Chunghwa Post awaiting credentials (ADR-0011 §02-02 stub)');
  }
  async createShipment(_p: CreateShipmentParams): Promise<ShipmentResult> {
    throw new Error('Chunghwa Post awaiting credentials (ADR-0011 §02-02 stub)');
  }
  async cancelShipment(_t: string): Promise<void> {
    throw new Error('Chunghwa Post awaiting credentials (ADR-0011 §02-02 stub)');
  }
  async trackShipment(_t: string): Promise<TrackingInfo> {
    throw new Error('Chunghwa Post awaiting credentials (ADR-0011 §02-02 stub)');
  }

  async parseWebhook(
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<ShippingWebhookEvent> {
    const sig = headers['x-post-signature'] ?? headers['X-Post-Signature'];
    const ts = headers['x-post-timestamp'] ?? headers['X-Post-Timestamp'];
    const path = headers['x-post-path'] ?? '/webhook';
    if (!sig || !ts) return invalid(rawBody, 'missing signature/timestamp');
    if (
      !verifyPostSignature('POST', path, ts, rawBody, sig, this.config.signSecret)
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
      provider: 'post',
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
    accepted: 'pending',
    dispatched: 'in-transit',
    arrived: 'arrived',
    delivered: 'delivered',
    returned: 'returned',
    cancelled: 'cancelled',
  };
  return m[s] ?? 'pending';
}

function invalid(rawBody: string, reason: string): ShippingWebhookEvent {
  return {
    provider: 'post',
    trackingNumber: '',
    status: 'pending',
    occurredAt: new Date().toISOString(),
    raw: { rawBody, reason },
    signatureValid: false,
    error: reason,
  };
}
