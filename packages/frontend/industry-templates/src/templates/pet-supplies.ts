import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 寵物用品：shop 主，社群感與訂閱制。 */
export const petSuppliesTemplate: IndustryTemplate = {
  industry: 'pet-supplies',
  primarySiteType: 'shop',
  pages: {
    ...emptyPages(),
    shop: [
      page('homepage', [
        block('home-hero', 'hero.split', 'pet-lifestyle', 1),
        block('home-pet-types', 'category.tiles', 'pet-type-filter', 2),
        block('home-subscription', 'shop.subscription-cta', 'monthly-box', 3),
        block('home-featured', 'product.featured-grid', 'grid-3', 4),
        block('home-community', 'social.instagram-feed', 'pet-spotlight', 5),
        block('home-footer', 'footer.shop', 'multi-column', 6),
      ]),
    ],
  },
  extraModules: ['shop.subscription'],
  copyTone: {
    brandVoice: '可愛、療癒、毛孩家人',
    targetAudience: '25-45 歲毛孩家長，視寵物為家人',
    keySellingPoints: [
      '獸醫師審核配方、天然成分',
      '訂閱月配箱、毛孩永遠驚喜',
      '推薦毛孩朋友、雙方都有禮',
    ],
  },
};
