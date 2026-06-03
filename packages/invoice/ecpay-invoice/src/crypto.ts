/**
 * 綠界電子發票 B2C v3 加解密。
 *
 * 規格：
 * - AES-128-CBC + PKCS7 padding
 * - 加密前先 URL encode（小寫 + .NET 風格特殊字元）
 * - 加密後 base64
 * - HashKey 16 字元、HashIV 16 字元
 *
 * 規格出處：綠界 B2C 電子發票 API V3 文件「3.2 資料加密說明」。
 */

import { createCipheriv, createDecipheriv } from 'node:crypto';

const ALGO = 'aes-128-cbc';

const ECPAY_URL_ENCODE_MAP: Array<[RegExp, string]> = [
  [/!/g, '%21'],
  [/\*/g, '%2a'],
  [/\(/g, '%28'],
  [/\)/g, '%29'],
];

/**
 * 綠界 URL encode：encodeURIComponent + .NET 風格特殊字元 + 「escape sequence 小寫」。
 *
 * 規格：B2C v3「2. URLEncode 採用 ASP.NET HttpUtility.UrlEncode 規則，escape sequence 小寫」。
 * 注意：只把 `%XX` 的 hex 轉小寫，不能把整個字串小寫（會破壞 JSON key 大小寫）。
 */
export function ecpayUrlEncode(value: string): string {
  let encoded = encodeURIComponent(value);
  for (const [from, to] of ECPAY_URL_ENCODE_MAP) {
    encoded = encoded.replace(from, to);
  }
  return encoded.replace(/%[0-9A-F]{2}/g, (m) => m.toLowerCase());
}

/** AES-128-CBC 加密 → base64。 */
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
  ]).toString('base64');
}

/** AES-128-CBC 解密 base64。 */
export function aesDecrypt(
  base64Cipher: string,
  hashKey: string,
  hashIv: string,
): string {
  assertKey(hashKey, hashIv);
  const decipher = createDecipheriv(ALGO, hashKey, hashIv);
  decipher.setAutoPadding(true);
  return Buffer.concat([
    decipher.update(Buffer.from(base64Cipher, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

/** Data 欄位編碼：urlEncode(JSON.stringify(data)) → aesEncrypt → base64。 */
export function encodeData(
  data: Record<string, unknown>,
  hashKey: string,
  hashIv: string,
): string {
  const json = JSON.stringify(data);
  const encoded = ecpayUrlEncode(json);
  return aesEncrypt(encoded, hashKey, hashIv);
}

/** 反向解碼回傳的 Data。 */
export function decodeData(
  base64Cipher: string,
  hashKey: string,
  hashIv: string,
): Record<string, unknown> {
  const decrypted = aesDecrypt(base64Cipher, hashKey, hashIv);
  return JSON.parse(decodeURIComponent(decrypted)) as Record<string, unknown>;
}

function assertKey(hashKey: string, hashIv: string): void {
  if (hashKey.length !== 16) throw new Error('ECPay invoice HashKey must be 16 chars');
  if (hashIv.length !== 16) throw new Error('ECPay invoice HashIV must be 16 chars');
}
