/**
 * 綠界 ECPay CheckMacValue 演算法。
 *
 * 步驟：
 *   1. 依 key 字母排序所有參數
 *   2. 串成 `HashKey=${HashKey}&K1=V1&K2=V2&...&HashIV=${HashIV}`
 *   3. URL encode（綠界要求小寫 + 特殊字元映射，與 .NET HttpUtility.UrlEncode 一致）
 *   4. 全字串轉小寫
 *   5. SHA256 hex → 全部大寫
 *
 * 規格出處：綠界全方位金流 ECPay 全功能介接技術文件。
 */

import { createHash } from 'node:crypto';

const ECPAY_URL_ENCODE_MAP: Array<[RegExp, string]> = [
  [/!/g, '%21'],
  [/\*/g, '%2a'],
  [/\(/g, '%28'],
  [/\)/g, '%29'],
];

/** 綠界規格 URL encode：基於 encodeURIComponent + 額外的 .NET 風格替換。 */
function ecpayUrlEncode(value: string): string {
  let encoded = encodeURIComponent(value);
  for (const [from, to] of ECPAY_URL_ENCODE_MAP) {
    encoded = encoded.replace(from, to);
  }
  return encoded;
}

export function buildCheckMacValue(
  params: Record<string, string | number>,
  hashKey: string,
  hashIv: string,
): string {
  const ordered: [string, string][] = Object.entries(params)
    .filter(([k]) => k !== 'CheckMacValue')
    .map(([k, v]) => [k, String(v)]);
  ordered.sort(([a], [b]) => a.localeCompare(b));
  const joined = ordered.map(([k, v]) => `${k}=${v}`).join('&');
  const raw = `HashKey=${hashKey}&${joined}&HashIV=${hashIv}`;
  const encoded = ecpayUrlEncode(raw).toLowerCase();
  return createHash('sha256').update(encoded).digest('hex').toUpperCase();
}

export function verifyCheckMacValue(
  params: Record<string, string | number>,
  receivedMac: string,
  hashKey: string,
  hashIv: string,
): boolean {
  const expected = buildCheckMacValue(params, hashKey, hashIv);
  return constantTimeEqual(expected, receivedMac.toUpperCase());
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
