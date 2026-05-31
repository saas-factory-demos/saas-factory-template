import type { HreflangEntry } from './types.js';

/**
 * 產生 hreflang `<link>` 標籤陣列（給 Next.js metadata.alternates.languages 或直接寫 HTML）。
 *
 * 會自動補上 `x-default` 指到第一個或指定 default。
 */
export function generateHreflangTags(
  entries: HreflangEntry[],
  defaultUrl?: string,
): string[] {
  const out = entries.map(
    (e) => `<link rel="alternate" hreflang="${escapeAttr(e.lang)}" href="${escapeAttr(e.url)}" />`,
  );
  const def = defaultUrl ?? entries[0]?.url;
  if (def) out.push(`<link rel="alternate" hreflang="x-default" href="${escapeAttr(def)}" />`);
  return out;
}

/**
 * Next.js metadata 用：回傳 `languages` 物件。
 */
export function toNextLanguages(entries: HreflangEntry[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const e of entries) out[e.lang] = e.url;
  return out;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
