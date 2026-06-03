/**
 * ezPay 發票加解密（與藍新 MPG 同演算法）。
 *
 * 規格：
 * - PostData_：AES-256-CBC 加密 query string → hex
 * - HashKey 32 字元、HashIV 16 字元
 *
 * 規格出處：藍新 ezPay 電子發票 API 文件「2-3 加密驗證」。
 */

import { createCipheriv, createDecipheriv } from 'node:crypto';

const ALGO = 'aes-256-cbc';

/** 物件 → query string（保留欄位順序）。 */
export function toQueryString(params: Record<string, string | number>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}

/** query string → 物件。 */
export function fromQueryString(qs: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of qs.split('&')) {
    if (!pair) continue;
    const idx = pair.indexOf('=');
    const k = idx === -1 ? pair : pair.slice(0, idx);
    const v = idx === -1 ? '' : pair.slice(idx + 1);
    out[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return out;
}

/** AES-256-CBC 加密成 hex。 */
export function aesEncrypt(
  plaintext: string,
  hashKey: string,
  hashIv: string,
): string {
  assertKey(hashKey, hashIv);
  const cipher = createCipheriv(ALGO, hashKey, hashIv);
  cipher.setAutoPadding(true);
  return Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]).toString('hex');
}

/** AES-256-CBC 解密 hex。 */
export function aesDecrypt(
  cipherHex: string,
  hashKey: string,
  hashIv: string,
): string {
  assertKey(hashKey, hashIv);
  const decipher = createDecipheriv(ALGO, hashKey, hashIv);
  decipher.setAutoPadding(true);
  return Buffer.concat([
    decipher.update(Buffer.from(cipherHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');
}

function assertKey(hashKey: string, hashIv: string): void {
  if (hashKey.length !== 32) throw new Error('ezPay HashKey must be 32 chars');
  if (hashIv.length !== 16) throw new Error('ezPay HashIV must be 16 chars');
}
