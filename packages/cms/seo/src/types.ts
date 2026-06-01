/** 通用 SEO metadata。 */
export interface SeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

/** OG image：商品。 */
export interface ProductOgData {
  title: string;
  price: string;
  imageUrl?: string;
  brand?: string;
}

/** OG image：文章。 */
export interface ArticleOgData {
  title: string;
  authorName?: string;
  publishedAt?: Date;
  coverUrl?: string;
}

/** OG image：課程。 */
export interface CourseOgData {
  title: string;
  instructor?: string;
  coverUrl?: string;
  durationMinutes?: number;
}

/** OG image：LP。 */
export interface LpOgData {
  title: string;
  subtitle?: string;
  heroUrl?: string;
}

/** Sitemap 單一節點。 */
export interface SitemapEntry {
  loc: string;
  lastmod?: Date;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/** Robots 規則。 */
export interface RobotsRule {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
  crawlDelay?: number;
}

/** hreflang 條目。 */
export interface HreflangEntry {
  lang: string;
  url: string;
}

/** Broken link 紀錄。 */
export interface BrokenLink {
  id: string;
  tenantId: string;
  /** 404 的 URL（站內路徑）。 */
  path: string;
  /** referrer URL（從哪裡點過來的）。 */
  referrer?: string;
  /** 累計命中次數。 */
  hitCount: number;
  /** 是否已處理（後台手動標記）。 */
  resolved: boolean;
  firstSeenAt: Date;
  lastSeenAt: Date;
}

/** Broken link 儲存層介面。 */
export interface BrokenLinkStore {
  recordHit(input: { tenantId: string; path: string; referrer?: string }): Promise<BrokenLink>;
  list(tenantId: string, opts?: { resolved?: boolean }): Promise<BrokenLink[]>;
  markResolved(id: string): Promise<BrokenLink>;
}
