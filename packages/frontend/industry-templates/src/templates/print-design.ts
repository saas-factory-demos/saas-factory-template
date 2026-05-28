import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 印刷設計：shop 主（印刷品線上下單），CMS 輔。 */
export const printDesignTemplate: IndustryTemplate = {
  industry: 'print-design',
  primarySiteType: 'shop',
  pages: {
    ...emptyPages(),
    shop: [
      page('homepage', [
        block('home-hero', 'hero.split', 'print-sample', 1),
        block('home-categories', 'category.tiles', 'print-type', 2),
        block('home-instant-quote', 'shop.instant-quote', 'config-calculator', 3),
        block('home-portfolio', 'gallery.portfolio', 'masonry', 4),
        block('home-process', 'content.process-showcase', 'upload-to-delivery', 5),
        block('home-footer', 'footer.shop', 'multi-column', 6),
      ]),
    ],
  },
  copyTone: {
    brandVoice: '專業、精準、印出心中所想',
    targetAudience: '設計師、品牌、企業活動採購',
    keySellingPoints: [
      '線上配置、即時報價',
      '彩色標準色、印出與螢幕一致',
      '台北 24 小時急件、北中南配送',
    ],
  },
};
