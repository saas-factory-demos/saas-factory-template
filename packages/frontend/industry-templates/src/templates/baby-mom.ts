import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 母嬰用品：shop 主，重視安全認證與會員制。 */
export const babyMomTemplate: IndustryTemplate = {
  industry: 'baby-mom',
  primarySiteType: 'shop',
  pages: {
    ...emptyPages(),
    shop: [
      page('homepage', [
        block('home-hero', 'hero.split', 'family-lifestyle', 1),
        block('home-age-stage', 'category.tiles', 'age-stage-filter', 2),
        block('home-bestseller', 'product.featured-grid', 'bestseller', 3),
        block('home-certification', 'features.grid-3', 'safety-badge', 4),
        block('home-mom-club', 'cta.membership', 'tier-card', 5),
        block('home-footer', 'footer.shop', 'multi-column', 6),
      ]),
    ],
  },
  extraModules: ['marketing.loyalty'],
  copyTone: {
    brandVoice: '安心、溫柔、貼心媽媽',
    targetAudience: '0-6 歲孩童的父母（孕婦到學齡前）',
    keySellingPoints: [
      '通過國際安全認證、無毒檢驗',
      '小兒科醫師與營養師推薦',
      '會員紅利點數可換尿布、奶粉',
    ],
  },
};
