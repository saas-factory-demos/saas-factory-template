import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 美容沙龍：LP 主（預約），CMS 輔（品牌）。 */
export const salonTemplate: IndustryTemplate = {
  industry: 'salon',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.editorial', 'beauty-portrait', 1),
        block('lp-services', 'features.grid-3', 'service-card', 2),
        block('lp-stylist', 'profile.stylist-grid', 'card-bio', 3),
        block('lp-gallery', 'gallery.before-after', 'masonry', 4),
        block('lp-booking', 'cta.booking', 'inline-calendar', 5),
        block('lp-testimonials', 'testimonials.carousel', 'avatar-quote', 6),
      ]),
    ],
  },
  extraModules: ['lp.sticky-cta', 'marketing.loyalty'],
  copyTone: {
    brandVoice: '優雅、療癒、寵愛自己',
    targetAudience: '25-55 歲注重美容與保養的女性',
    keySellingPoints: [
      '資深美容師、十年以上經驗',
      '日韓最新技術、私密包廂',
      'LINE 預約最方便、會員專屬優惠',
    ],
  },
};
