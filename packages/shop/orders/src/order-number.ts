import { randomInt } from 'node:crypto';

import type { OrderNumberOptions } from './types.js';

/** 隨機後綴字元集，去除易混淆字元。 */
const SUFFIX_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * 產生訂單編號（TW 慣例：YYYYMMDD-NNNN-XXXX）。
 *
 * 加入 CSPRNG 隨機後綴避免訂單號被線性枚舉爬資料。
 *
 * @param dailySeq 當日流水號，從 1 開始。呼叫端負責持久化計數器。
 */
export function generateOrderNumber(
  dailySeq: number,
  options: OrderNumberOptions = {},
): string {
  const now = options.now?.() ?? new Date();
  const pad = options.padLength ?? 4;
  const suffixLen = options.randomSuffixLength ?? 4;
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seqPart = `${y}${m}${d}-${String(dailySeq).padStart(pad, '0')}`;
  if (suffixLen <= 0) return seqPart;
  let suffix = '';
  for (let i = 0; i < suffixLen; i++) {
    suffix += SUFFIX_CHARSET.charAt(randomInt(0, SUFFIX_CHARSET.length));
  }
  return `${seqPart}-${suffix}`;
}

/**
 * 解析訂單編號為日期 + 流水號（隨機後綴若有則忽略）。
 */
export function parseOrderNumber(
  num: string,
): { date: string; seq: number } | null {
  const match = num.match(/^(\d{4})(\d{2})(\d{2})-(\d+)(?:-[A-Z0-9]+)?$/);
  if (!match) return null;
  return {
    date: `${match[1]}-${match[2]}-${match[3]}`,
    seq: Number.parseInt(match[4]!, 10),
  };
}
