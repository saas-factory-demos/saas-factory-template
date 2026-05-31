import { block, emptyPages, lpHomepage, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 食品零食：shop 主，LP 輔（節慶禮盒）。 */
export const foodSnacksTemplate: IndustryTemplate = {
  industry: 'food-snacks',
  primarySiteType: 'shop',
  pages: {
    ...emptyPages(),
    shop: [
      page('homepage', [
        block('home-hero', 'hero.product-showcase', 'food-styling', 1),
        block('home-bestseller', 'product.featured-grid', 'bestseller', 2),
        block('home-gift-box', 'product.featured-grid', 'gift-box', 3),
        block('home-story', 'content.brand-story', 'editorial', 4),
        block('home-flash-sale', 'marketing.flash-sale-banner', 'countdown', 5),
        block('home-footer', 'footer.shop', 'multi-column', 6),
      ]),
    ],
    lp: [lpHomepage('seasonal-gift')],
  },
  extraModules: ['marketing.line-marketing'],
  copyTone: {
    brandVoice: '溫暖、好吃、信賴感',
    targetAudience: '全年齡層，特別是送禮場合的消費者',
    keySellingPoints: [
      '台灣在地小農合作、產地直送',
      '無添加防腐劑、天然食材',
      '節慶禮盒精緻包裝、送禮體面',
    ],
  },
};
