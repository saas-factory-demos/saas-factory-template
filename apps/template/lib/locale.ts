/**
 * Locale 工具：對齊 Payload localization config（payload.config.ts）。
 *
 * 修改 SUPPORTED_LOCALES 時請同步更新 payload.config.ts 的 localization.locales。
 */

export const SUPPORTED_LOCALES = ['zh-TW', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'zh-TW';

/**
 * Type guard：判斷 string 是否為支援的 locale。
 */
export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * 從 Accept-Language header 偵測偏好 locale。
 *
 * 簡化版：取第一個與支援列表交集者；找不到則回 DEFAULT_LOCALE。
 */
export function detectLocaleFromHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const candidates = acceptLanguage
    .split(',')
    .map((part) => part.trim().split(';')[0]?.trim() ?? '')
    .filter(Boolean);
  for (const candidate of candidates) {
    // 完整匹配
    if (isSupportedLocale(candidate)) return candidate;
    // 主語碼匹配（如 'zh' → 'zh-TW'）
    const main = candidate.split('-')[0];
    if (main === 'zh') return 'zh-TW';
    if (main === 'en') return 'en';
  }
  return DEFAULT_LOCALE;
}
