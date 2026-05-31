import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 健身房：LP 主（入會招攬），course 輔（線上課）。 */
export const fitnessGymTemplate: IndustryTemplate = {
  industry: 'fitness-gym',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.split', 'workout-video-bg', 1),
        block('lp-trial', 'cta.trial-offer', 'highlighted-card', 2),
        block('lp-coaches', 'profile.coach-grid', 'card-grid', 3),
        block('lp-facilities', 'gallery.facility-tour', 'masonry', 4),
        block('lp-pricing', 'pricing.tiers', 'membership-card', 5),
        block('lp-cta', 'cta.final', 'sticky-bottom', 6),
      ]),
    ],
  },
  extraModules: ['lp.sticky-cta'],
  copyTone: {
    brandVoice: '熱情、激勵、改變從今天開始',
    targetAudience: '想要瘦身、增肌、改善體態的 20-50 歲都會族',
    keySellingPoints: [
      '專業教練 1 對 1 指導',
      '頂級器材、清潔安全環境',
      '入會即送體驗課、無痛上手',
    ],
  },
};
