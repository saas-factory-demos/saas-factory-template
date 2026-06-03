import { block, emptyPages, lpHomepage, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 美妝保養：shop 主，LP 輔（新品 launch）。 */
export const beautySkincareTemplate: IndustryTemplate = {
  industry: 'beauty-skincare',
  primarySiteType: 'shop',
  pages: {
    ...emptyPages(),
    shop: [
      page('homepage', [
        block('home-hero', 'hero.editorial', 'beauty-portrait', 1),
        block('home-routine', 'content.routine-guide', 'step-by-step', 2),
        block('home-products', 'product.featured-grid', 'grid-3', 3),
        block('home-ingredients', 'content.ingredient-spotlight', 'card-detail', 4),
        block('home-testimonials', 'testimonials.carousel', 'before-after', 5),
        block('home-footer', 'footer.shop', 'multi-column', 6),
      ]),
    ],
    lp: [lpHomepage('new-launch')],
  },
  extraModules: ['marketing.line-marketing'],
  copyTone: {
    brandVoice: '精緻、優雅、療癒',
    targetAudience: '20-50 歲注重保養與美容儀式的女性',
    keySellingPoints: [
      '天然安心成分、敏感肌可用',
      '韓國／日本研發實驗室',
      '網紅與美容編輯一致推薦',
    ],
  },
};
