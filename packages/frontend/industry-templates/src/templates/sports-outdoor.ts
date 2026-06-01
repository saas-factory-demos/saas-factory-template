import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 運動戶外：shop 主，動感與規格驅動。 */
export const sportsOutdoorTemplate: IndustryTemplate = {
  industry: 'sports-outdoor',
  primarySiteType: 'shop',
  pages: {
    ...emptyPages(),
    shop: [
      page('homepage', [
        block('home-hero', 'hero.editorial', 'action-shot', 1),
        block('home-collections', 'category.tiles', 'sport-type', 2),
        block('home-bestseller', 'product.featured-grid', 'bestseller', 3),
        block('home-spec-compare', 'product.comparison', 'spec-table', 4),
        block('home-flash-sale', 'marketing.flash-sale-banner', 'countdown', 5),
        block('home-footer', 'footer.shop', 'multi-column', 6),
      ]),
    ],
  },
  extraModules: ['marketing.flash-sale'],
  copyTone: {
    brandVoice: '熱血、突破極限、專業',
    targetAudience: '18-45 歲運動愛好者，從休閒到競技選手',
    keySellingPoints: [
      '專業選手實戰測試',
      '輕量、耐用、頂規材質',
      '官方授權、原廠保固',
    ],
  },
};
