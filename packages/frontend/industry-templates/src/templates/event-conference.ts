import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 活動會議：LP 主（售票），CMS 輔（議程詳情）。 */
export const eventConferenceTemplate: IndustryTemplate = {
  industry: 'event-conference',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.editorial', 'event-cinematic', 1),
        block('lp-countdown', 'marketing.countdown-banner', 'large-clock', 2),
        block('lp-agenda', 'content.agenda-timeline', 'day-by-day', 3),
        block('lp-speakers', 'profile.speaker-grid', 'card-bio', 4),
        block('lp-pricing', 'pricing.tiers', 'early-bird-tier', 5),
        block('lp-cta', 'cta.buy-ticket', 'sticky-bottom', 6),
      ]),
    ],
  },
  extraModules: ['lp.countdown', 'lp.sticky-cta'],
  copyTone: {
    brandVoice: '激盪、不容錯過、業界菁英聚集',
    targetAudience: '產業專業人士、進修族、合作媒合需求者',
    keySellingPoints: [
      '頂尖講者陣容、業界第一手洞察',
      '早鳥優惠、限額搶購中',
      '會後社群、人脈持續發酵',
    ],
  },
};
