import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 旅遊行程：LP 主（行程銷售），CMS 輔（公司介紹）。 */
export const travelTourTemplate: IndustryTemplate = {
  industry: 'travel-tour',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.editorial', 'destination-cinematic', 1),
        block('lp-itinerary', 'content.itinerary-timeline', 'day-by-day', 2),
        block('lp-included', 'features.grid-3', 'inclusion-list', 3),
        block('lp-gallery', 'gallery.destination', 'masonry', 4),
        block('lp-pricing', 'pricing.tiers', 'departure-date', 5),
        block('lp-cta', 'cta.booking', 'limited-seats', 6),
      ]),
    ],
  },
  extraModules: ['lp.sticky-cta', 'lp.countdown'],
  copyTone: {
    brandVoice: '夢想、放鬆、安心託付',
    targetAudience: '35-65 歲喜愛深度旅遊的家庭與退休族',
    keySellingPoints: [
      '在地導遊、深度文化體驗',
      '小團精緻服務、最多 16 人',
      '全程不購物站、行程透明',
    ],
  },
};
