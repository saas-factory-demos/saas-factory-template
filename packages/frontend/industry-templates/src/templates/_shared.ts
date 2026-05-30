import type {
  BlockInstance,
  FrontendBlockKey,
  PageComposition,
  SiteType,
} from '@saas-factory/factory-types';

/**
 * 建立一個 BlockInstance 的縮寫工廠，減少 33 個 template 檔的重複樣板。
 *
 * `type` 為 `FrontendBlockKey` enum（09e 收緊）。33 個 template 沿用 dotted slug 風格
 * （例：`hero.split`），blocks-library 的 Tier 1 simple key（例：`hero`）由
 * BlockRenderer 對應渲染。
 */
export function block(
  id: string,
  type: FrontendBlockKey,
  variant: string,
  order: number,
): BlockInstance {
  return {
    id,
    type,
    variant,
    config: {},
    visible: true,
    order,
  };
}

/**
 * 建立一個 PageComposition 的縮寫工廠。
 */
export function page(pageKey: string, blocks: BlockInstance[]): PageComposition {
  return { pageKey, blocks };
}

/**
 * 五個 site type 的空 pages 預設。33 個 template 都用此基底，
 * 再把主 site type 的陣列覆寫成實際內容。
 */
export function emptyPages(): Record<SiteType, PageComposition[]> {
  return {
    cms: [],
    shop: [],
    course: [],
    lp: [],
    blog: [],
  };
}

// ─── 常用 page composition factories ────────────────────────────────

/**
 * 標準電商首頁（shop primary）：6 個 block。
 */
export function shopHomepage(): PageComposition {
  return page('homepage', [
    block('home-hero', 'hero.product-showcase', 'split', 1),
    block('home-featured', 'product.featured-grid', 'grid-3', 2),
    block('home-categories', 'category.tiles', 'tiles-4', 3),
    block('home-testimonials', 'testimonials.carousel', 'avatar-quote', 4),
    block('home-newsletter', 'cta.newsletter', 'inline-form', 5),
    block('home-footer', 'footer.shop', 'multi-column', 6),
  ]);
}

/**
 * 標準 LP（landing page primary）：6 個 block，銷售漏斗排序。
 */
export function lpHomepage(pageKey = 'landing'): PageComposition {
  return page(pageKey, [
    block(`${pageKey}-hero`, 'hero.split', 'video-bg', 1),
    block(`${pageKey}-benefits`, 'features.grid-3', 'icon-title-text', 2),
    block(`${pageKey}-social-proof`, 'testimonials.carousel', 'avatar-quote', 3),
    block(`${pageKey}-pricing`, 'pricing.tiers', 'three-tier', 4),
    block(`${pageKey}-faq`, 'faq.accordion', 'two-column', 5),
    block(`${pageKey}-cta`, 'cta.final', 'centered-form', 6),
  ]);
}

/**
 * 標準 CMS 首頁（about / corporate）：5 個 block。
 */
export function cmsHomepage(): PageComposition {
  return page('homepage', [
    block('home-hero', 'hero.editorial', 'full-bleed', 1),
    block('home-intro', 'content.intro', 'two-column', 2),
    block('home-services', 'features.grid-3', 'icon-title-text', 3),
    block('home-cta', 'cta.contact', 'centered', 4),
    block('home-footer', 'footer.corporate', 'multi-column', 5),
  ]);
}

/**
 * 標準 course 首頁：6 個 block。
 */
export function courseHomepage(): PageComposition {
  return page('homepage', [
    block('home-hero', 'hero.course', 'instructor-spotlight', 1),
    block('home-curriculum', 'course.curriculum', 'chapter-list', 2),
    block('home-instructor', 'profile.instructor', 'card-bio', 3),
    block('home-testimonials', 'testimonials.carousel', 'student-story', 4),
    block('home-pricing', 'pricing.tiers', 'one-time-vs-payment-plan', 5),
    block('home-faq', 'faq.accordion', 'two-column', 6),
  ]);
}

/**
 * 標準 blog 首頁：4 個 block。
 */
export function blogHomepage(): PageComposition {
  return page('homepage', [
    block('home-hero', 'hero.editorial', 'author-spotlight', 1),
    block('home-latest', 'blog.latest-posts', 'grid-3', 2),
    block('home-newsletter', 'cta.newsletter', 'inline-form', 3),
    block('home-footer', 'footer.blog', 'minimal', 4),
  ]);
}
