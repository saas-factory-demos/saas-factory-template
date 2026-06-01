/**
 * 反垃圾偵測結果。
 */
export interface SpamCheckResult {
  isSpam: boolean;
  reasons: string[];
}

/**
 * 偵測單筆留言是否為垃圾。
 *
 * 規則：
 * - honeypot 有值（bot 自動填）
 * - 命中關鍵字黑名單
 * - 內容含超過 maxLinks 個連結
 * - 內容過短（< minLength）或過長（> maxLength）
 */
export function detectSpam(
  content: string,
  options: {
    honeypot?: string;
    blockedKeywords?: string[];
    maxLinks?: number;
    minLength?: number;
    maxLength?: number;
  } = {},
): SpamCheckResult {
  const reasons: string[] = [];
  if (options.honeypot && options.honeypot.trim().length > 0) {
    reasons.push('honeypot');
  }
  const lower = content.toLowerCase();
  for (const kw of options.blockedKeywords ?? []) {
    if (lower.includes(kw.toLowerCase())) {
      reasons.push(`keyword:${kw}`);
      break;
    }
  }
  const linkCount = (content.match(/https?:\/\//gi) ?? []).length;
  if (options.maxLinks !== undefined && linkCount > options.maxLinks) {
    reasons.push(`too-many-links:${linkCount}`);
  }
  const len = content.trim().length;
  if (options.minLength !== undefined && len < options.minLength) {
    reasons.push('too-short');
  }
  if (options.maxLength !== undefined && len > options.maxLength) {
    reasons.push('too-long');
  }
  return { isSpam: reasons.length > 0, reasons };
}
