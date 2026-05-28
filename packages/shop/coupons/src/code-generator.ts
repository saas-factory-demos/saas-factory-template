/**
 * Code 產生器。
 *
 * 批量 coupon code 屬於可兌現的 bearer token，必須使用 CSPRNG。
 * Math.random / V8 xorshift128+ 可從少數輸出反推內部狀態。
 */

import { randomInt } from 'node:crypto';

import type { BulkGenerateOptions } from './types.js';

/**
 * 預設字元集，已去除易混淆字元（0、O、1、I、L）。
 */
const DEFAULT_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * 產生單一隨機 code。
 */
export function generateCode(length: number, charset = DEFAULT_CHARSET): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += charset.charAt(randomInt(0, charset.length));
  }
  return out;
}

/**
 * 批量產生 code，自動去重。
 *
 * 若指定數量過大或 length 過小，將拋出錯誤避免無限迴圈。
 */
export function generateBulkCodes(options: BulkGenerateOptions): string[] {
  const { count, length = 10, prefix, charset = DEFAULT_CHARSET } = options;
  if (count <= 0) return [];
  const maxPossible = Math.pow(charset.length, length);
  if (count > maxPossible / 2) {
    throw new Error('產生數量過大，請增加 length 或調整字元集');
  }

  const used = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 10;
  while (used.size < count && attempts < maxAttempts) {
    const raw = generateCode(length, charset);
    const code = prefix ? `${prefix}-${raw}` : raw;
    used.add(code);
    attempts++;
  }
  if (used.size < count) {
    throw new Error(`無法在 ${maxAttempts} 次嘗試內產生足夠 code`);
  }
  return Array.from(used);
}
