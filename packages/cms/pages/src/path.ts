import type { Page } from './types.js';

/**
 * 從 page 與整批同租戶 page 列表計算完整 URL path。
 * - 首頁（isHomepage=true）回傳「/」
 * - 一般頁回傳「/grandparent/parent/slug」
 */
export function computeFullPath(page: Page, allPages: Page[]): string {
  if (page.isHomepage) return '/';
  const segments: string[] = [page.slug];
  let cursor: Page | undefined = page;
  const map = new Map(allPages.map((p) => [p.id, p]));
  while (cursor?.parentId) {
    const parent = map.get(cursor.parentId);
    if (!parent || parent.isHomepage) break;
    segments.unshift(parent.slug);
    cursor = parent;
  }
  return `/${segments.join('/')}`;
}

/**
 * 從 URL path 反查 page。回傳對應頁面或 undefined。
 * - 「/」回傳 homepage
 * - 「/about」回傳頂層 slug=about
 * - 「/services/web-design」遞迴比對
 */
export function findPageByPath(path: string, allPages: Page[]): Page | undefined {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  if (trimmed === '') return allPages.find((p) => p.isHomepage);
  const segments = trimmed.split('/');
  let parentId: string | undefined;
  let match: Page | undefined;
  for (const seg of segments) {
    match = allPages.find(
      (p) => (p.parentId ?? undefined) === (parentId ?? undefined) && p.slug === seg,
    );
    if (!match) return undefined;
    parentId = match.id;
  }
  return match;
}

/**
 * Slug 正規化：小寫、底線轉減號、移除非 URL-safe 字元。
 */
export function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
