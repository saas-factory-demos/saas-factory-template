/**
 * 台灣電子發票載具格式驗證。
 *
 * 規格依據：財政部電子發票整合服務平台「載具格式說明」。
 */

import type { InvoiceCarrier } from './types.js';

/** 手機條碼：`/` + 7 碼（英數＋特殊符號），共 8 碼。 */
const MOBILE_BARCODE_REGEX = /^\/[0-9A-Z+\-./]{7}$/;

/** 自然人憑證：2 碼大寫英文 + 14 碼數字，共 16 碼。 */
const NATURAL_PERSON_CERT_REGEX = /^[A-Z]{2}\d{14}$/;

/** 統一編號：8 碼數字。 */
const COMPANY_TAX_ID_REGEX = /^\d{8}$/;

/** 愛心碼：3-7 碼數字。 */
const DONATION_CODE_REGEX = /^\d{3,7}$/;

/**
 * 驗證發票載具格式合法性。
 *
 * 回傳 `{ valid: true }` 或 `{ valid: false, error: string }`。
 */
export function validateCarrier(
  carrier: InvoiceCarrier,
): { valid: true } | { valid: false; error: string } {
  switch (carrier.type) {
    case 'mobile-barcode':
      if (!carrier.value || !MOBILE_BARCODE_REGEX.test(carrier.value)) {
        return { valid: false, error: '手機條碼格式錯誤（需 / 開頭共 8 碼）' };
      }
      return { valid: true };
    case 'natural-person-cert':
      if (
        !carrier.value ||
        !NATURAL_PERSON_CERT_REGEX.test(carrier.value)
      ) {
        return {
          valid: false,
          error: '自然人憑證格式錯誤（需 2 碼英文 + 14 碼數字）',
        };
      }
      return { valid: true };
    case 'company-tax-id':
      if (!carrier.value || !COMPANY_TAX_ID_REGEX.test(carrier.value)) {
        return { valid: false, error: '統一編號格式錯誤（需 8 碼數字）' };
      }
      return { valid: true };
    case 'donation':
      if (
        !carrier.donationCode ||
        !DONATION_CODE_REGEX.test(carrier.donationCode)
      ) {
        return { valid: false, error: '愛心碼格式錯誤（3-7 碼數字）' };
      }
      return { valid: true };
    case 'member':
    case 'paper':
      return { valid: true };
    default: {
      const _exhaustive: never = carrier.type;
      return { valid: false, error: `未知載具類型: ${String(_exhaustive)}` };
    }
  }
}

/**
 * 統一編號 checksum 驗算（財政部演算法）。
 *
 * 規則：
 *   1. 8 位數字，每位乘上權重 [1,2,1,2,1,2,4,1]
 *   2. 各位數字相加（兩位數則拆和），總和 mod 10 = 0 即合法
 *   3. 第 7 位為 7 時，總和 + 1 後 mod 10 也算合法
 */
export function isValidTaxId(taxId: string): boolean {
  if (!COMPANY_TAX_ID_REGEX.test(taxId)) return false;
  const weights = [1, 2, 1, 2, 1, 2, 4, 1];
  let sum = 0;
  for (let i = 0; i < 8; i += 1) {
    const ch = taxId[i];
    if (!ch) return false;
    const product = Number(ch) * (weights[i] ?? 0);
    sum += Math.floor(product / 10) + (product % 10);
  }
  if (sum % 10 === 0) return true;
  if (taxId[6] === '7' && (sum + 1) % 10 === 0) return true;
  return false;
}
