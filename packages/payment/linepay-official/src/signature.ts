/**
 * LINE Pay 官方 v3 API 簽章。
 *
 * 簽章方式：HMAC-SHA256(channelSecret + uri + body + nonce, channelSecret) → Base64
 * Header：
 *   X-LINE-ChannelId: <channelId>
 *   X-LINE-Authorization-Nonce: <uuid>
 *   X-LINE-Authorization: <signature>
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

/** 建立 LINE Pay v3 簽章（HMAC-SHA256，Base64 編碼）。 */
export function buildLinePaySignature(
  channelSecret: string,
  uri: string,
  body: string,
  nonce: string,
): string {
  const payload = `${channelSecret}${uri}${body}${nonce}`;
  return createHmac('sha256', channelSecret).update(payload).digest('base64');
}

/** 驗證 LINE Pay 回呼簽章，使用 timingSafeEqual 避免時序側信道。 */
export function verifyLinePaySignature(
  channelSecret: string,
  uri: string,
  body: string,
  nonce: string,
  receivedSig: string,
): boolean {
  const expected = buildLinePaySignature(channelSecret, uri, body, nonce);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(receivedSig, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
