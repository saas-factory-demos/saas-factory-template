/**
 * Stripe webhook 簽章驗證。
 *
 * Stripe-Signature header 格式：
 *   `t=<unix_ts>,v1=<hmac>,v1=<hmac>...,v0=<deprecated>`
 *
 * 驗算：HMAC-SHA256(`${t}.${rawBody}`, webhook_secret) 應等於任一 v1。
 *
 * 規格出處：https://stripe.com/docs/webhooks/signatures
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

export interface StripeSignatureParts {
  timestamp: number;
  signatures: string[];
}

export function parseStripeSignature(header: string): StripeSignatureParts | null {
  const v1: string[] = [];
  let timestamp = 0;
  for (const segment of header.split(',')) {
    const [k, v] = segment.split('=');
    if (!k || !v) continue;
    if (k === 't') {
      timestamp = Number(v);
    } else if (k === 'v1') {
      v1.push(v);
    }
  }
  if (!timestamp || v1.length === 0) return null;
  return { timestamp, signatures: v1 };
}

export function verifyStripeSignature(
  rawBody: string,
  header: string,
  secret: string,
  toleranceSeconds = 300,
): boolean {
  const parsed = parseStripeSignature(header);
  if (!parsed) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSec - parsed.timestamp) > toleranceSeconds) {
    return false;
  }
  const signedPayload = `${parsed.timestamp}.${rawBody}`;
  const expected = createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  return parsed.signatures.some((sig) => {
    try {
      const sigBuf = Buffer.from(sig, 'hex');
      if (sigBuf.length !== expectedBuf.length) return false;
      return timingSafeEqual(sigBuf, expectedBuf);
    } catch {
      return false;
    }
  });
}
