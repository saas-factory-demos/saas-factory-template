import { block, emptyPages, lpHomepage, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 保健食品：shop 主，LP 輔（訂閱制與名單收集）。 */
export const supplementTemplate: IndustryTemplate = {
  industry: 'supplement',
  primarySiteType: 'shop',
  pages: {
    ...emptyPages(),
    shop: [
      page('homepage', [
        block('home-hero', 'hero.split', 'lifestyle-image', 1),
        block('home-benefits', 'features.grid-3', 'icon-title-text', 2),
        block('home-products', 'product.featured-grid', 'grid-3', 3),
        block('home-subscription', 'shop.subscription-cta', 'tier-card', 4),
        block('home-testimonials', 'testimonials.carousel', 'avatar-quote', 5),
        block('home-faq', 'faq.accordion', 'two-column', 6),
      ]),
    ],
    lp: [lpHomepage('promo')],
  },
  extraModules: ['shop.subscription', 'marketing.line-marketing'],
  copyTone: {
    brandVoice: '專業可信、溫和有同理心',
    targetAudience: '注重健康的 30-55 歲消費者，對成分與功效敏感',
    keySellingPoints: [
      '通過第三方檢驗、安全有保障',
      '科學配方、效果可追蹤',
      '訂閱制定期送、不必煩惱補貨',
    ],
  },
};
