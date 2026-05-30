import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 餐飲：LP 主（訂位），CMS 輔（菜單與品牌）。 */
export const restaurantTemplate: IndustryTemplate = {
  industry: 'restaurant',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.editorial', 'food-styling', 1),
        block('lp-menu-highlights', 'product.featured-grid', 'menu-card', 2),
        block('lp-chef', 'profile.chef', 'card-bio', 3),
        block('lp-ambience', 'gallery.ambience', 'masonry', 4),
        block('lp-reservation', 'cta.reservation', 'inline-form', 5),
        block('lp-press', 'social.press-mentions', 'logo-strip', 6),
      ]),
    ],
  },
  extraModules: ['lp.sticky-cta'],
  copyTone: {
    brandVoice: '美味、講究、值得期待',
    targetAudience: '追求美食體驗的饕客與商務／家庭聚餐',
    keySellingPoints: [
      '主廚精心設計菜單、當令食材',
      '私密包廂、適合重要場合',
      'LINE 訂位即時回覆、不必等電話',
    ],
  },
};
