/**
 * 前台路由路徑模板。
 *
 * 為何抽出來：payload.config.ts 的 revalidatePaths callback 原本各自寫死 `/zh-TW/...`、
 * `/en/...` 字串，URL 結構若改（例：`/products` → `/shop`）會四處改。集中管理。
 *
 * 同一份 SUPPORTED_LOCALES 跟 `lib/locale.ts` 對齊（這裡為了避免循環依賴重寫常數）。
 */

const LOCALES = ['zh-TW', 'en'] as const;

/** 根目錄 + locale 根（首頁 revalidate 用） */
export const HOMEPAGE_PATHS = ['/', '/zh-TW', '/en'] as const;

/**
 * 給定 prefix（如 'pages' / 'products' / 'courses' / 'blog'）+ slug，
 * 產出所有 locale 的完整路徑陣列。
 *
 * slug 為空 → 回 listing 頁（無 slug 段）。
 *
 * @example
 * localizedPaths('pages', 'about')
 * // => ['/zh-TW/pages/about', '/en/pages/about']
 *
 * localizedPaths('blog', '')
 * // => ['/zh-TW/blog', '/en/blog']
 */
export function localizedPaths(prefix: string, slug: string): readonly string[] {
  if (slug === '') {
    return LOCALES.map((locale) => `/${locale}/${prefix}`);
  }
  return LOCALES.map((locale) => `/${locale}/${prefix}/${slug}`);
}

/**
 * Pages（CMS）路徑：首頁加 HOMEPAGE_PATHS，非首頁加 `/{locale}/pages/{slug}`。
 */
export function cmsPagePaths(doc: Record<string, unknown> | undefined): readonly string[] {
  const slug = typeof doc?.slug === 'string' ? doc.slug : '';
  const isHome = doc?.isHomepage === true;
  if (isHome) return HOMEPAGE_PATHS;
  return slug === '' ? HOMEPAGE_PATHS : [...HOMEPAGE_PATHS, ...localizedPaths('pages', slug)];
}

/** Shop 商品頁路徑 prefix */
export const SHOP_PREFIX = 'products';
/** Course 課程頁路徑 prefix */
export const COURSE_PREFIX = 'courses';
/** Blog 文章頁路徑 prefix */
export const BLOG_PREFIX = 'blog';
