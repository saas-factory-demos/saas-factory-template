import { block, emptyPages, lpHomepage, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 科技配件：shop 主，LP 輔（新品快閃）。 */
export const techAccessoriesTemplate: IndustryTemplate = {
  industry: 'tech-accessories',
  primarySiteType: 'shop',
  pages: {
    ...emptyPages(),
    shop: [
      page('homepage', [
        block('home-hero', 'hero.product-showcase', 'video-loop', 1),
        block('home-new-arrival', 'product.featured-grid', 'new-arrival', 2),
        block('home-specs', 'features.grid-3', 'icon-spec-list', 3),
        block('home-flash-sale', 'marketing.flash-sale-banner', 'countdown', 4),
        block('home-reviews', 'testimonials.carousel', 'star-rating', 5),
        block('home-footer', 'footer.shop', 'multi-column', 6),
      ]),
    ],
    lp: [lpHomepage('product-launch')],
  },
  extraModules: ['marketing.flash-sale', 'lp.countdown'],
  copyTone: {
    brandVoice: '科技感、酷炫、效率導向',
    targetAudience: '20-40 歲科技愛好者，追求新潮與性能',
    keySellingPoints: [
      '極致規格與創新設計',
      '限量發售、錯過再等一年',
      '原廠保固一年、台灣現貨出貨',
    ],
  },
};
