/**
 * 藍新金流加解密工具。
 *
 * 藍新規格：
 * - TradeInfo：將 query string 用 AES-256-CBC + PKCS7 加密，Key/IV 為 HashKey/HashIV
 * - TradeSha：SHA-256(`HashKey=${HashKey}&${TradeInfo}&HashIV=${HashIV}`)，全大寫
 * - HashKey 為 32 字元、HashIV 為 16 字元（由商店後台取得）
 *
 * 規格出處：藍新金流官方文件「加密驗證」段落
 */

import {
  createCipheriv,
  createDecipheriv,
  createHash,
} from 'node:crypto';

const ALGORITHM = 'aes-256-cbc';

/** 將物件轉成藍新風格的 query string（保留欄位順序）。 */
export function toQueryString(params: Record<string, string | number>): string {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
}

/** 將 query string 轉回物件。 */
export function fromQueryString(qs: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const pair of qs.split('&')) {
    if (!pair) continue;
    const idx = pair.indexOf('=');
    if (idx === -1) {
      result[decodeURIComponent(pair)] = '';
    } else {
      const key = decodeURIComponent(pair.slice(0, idx));
      const value = decodeURIComponent(pair.slice(idx + 1));
      result[key] = value;
    }
  }
  return result;
}

/** AES-256-CBC 加密成 hex 字串（藍新格式）。 */
export function aesEncrypt(
  plaintext: string,
  hashKey: string,
  hashIv: string,
): string {
  assertKeyIv(hashKey, hashIv);
  const cipher = createCipheriv(ALGORITHM, hashKey, hashIv);
  cipher.setAutoPadding(true);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  return encrypted.toString('hex');
}

/** AES-256-CBC 解密 hex 字串。 */
export function aesDecrypt(
  cipherHex: string,
  hashKey: string,
  hashIv: string,
): string {
  assertKeyIv(hashKey, hashIv);
  const decipher = createDecipheriv(ALGORITHM, hashKey, hashIv);
  decipher.setAutoPadding(true);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipherHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

/**
 * 產生 TradeSha：
 *   SHA-256(`HashKey=${HashKey}&${tradeInfo}&HashIV=${HashIV}`)
 *   → 結果轉大寫 hex
 */
export function buildTradeSha(
  tradeInfo: string,
  hashKey: string,
  hashIv: string,
): string {
  const raw = `HashKey=${hashKey}&${tradeInfo}&HashIV=${hashIv}`;
  return createHash('sha256').update(raw).digest('hex').toUpperCase();
}

/** 驗證 callback 帶回的 TradeSha 是否合法。 */
export function verifyTradeSha(
  tradeInfo: string,
  receivedSha: string,
  hashKey: string,
  hashIv: string,
): boolean {
  const expected = buildTradeSha(tradeInfo, hashKey, hashIv);
  return constantTimeEqual(expected, receivedSha.toUpperCase());
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function assertKeyIv(hashKey: string, hashIv: string): void {
  if (hashKey.length !== 32) {
    throw new Error('NewebPay HashKey must be 32 chars');
  }
  if (hashIv.length !== 16) {
    throw new Error('NewebPay HashIV must be 16 chars');
  }
}
