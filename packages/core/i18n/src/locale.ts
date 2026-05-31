import { DEFAULT_LOCALE, LOCALES } from './types.js';

import type { Locale } from './types.js';

/**
 * 從 URL pathname 取出 locale prefix。
 *
 * `/zh-TW/products` → 'zh-TW'；`/products` → null。
 */
export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (!first) return null;
  return (LOCALES as ReadonlyArray<string>).includes(first)
    ? (first as Locale)
    : null;
}

/**
 * 從 Accept-Language header 解析最匹配的支援語系。
 */
export function negotiateLocale(acceptLanguage: string | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const entries = acceptLanguage
    .split(',')
    .map((entry) => {
      const [tag, qPart] = entry.trim().split(';q=');
      return { tag: tag?.toLowerCase() ?? '', q: qPart ? Number(qPart) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of entries) {
    const exact = LOCALES.find((l) => l.toLowerCase() === tag);
    if (exact) return exact;
    const lang = tag.split('-')[0];
    const prefix = LOCALES.find((l) => l.toLowerCase().startsWith(`${lang}-`));
    if (prefix) return prefix;
    const bare = LOCALES.find((l) => l.toLowerCase() === lang);
    if (bare) return bare;
  }
  return DEFAULT_LOCALE;
}

/**
 * 產生 hreflang 標記陣列（SEO 用）。
 */
export function buildHreflangs(
  baseUrl: string,
  pathWithoutLocale: string,
): Array<{ hreflang: string; href: string }> {
  return LOCALES.map((locale) => ({
    hreflang: locale,
    href: `${baseUrl}/${locale}${pathWithoutLocale}`,
  }));
}
