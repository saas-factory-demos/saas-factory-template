import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 選舉造勢：LP 主（政見與動員），CMS / blog 輔（新聞）。 */
export const politicalCampaignTemplate: IndustryTemplate = {
  industry: 'political-campaign',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.editorial', 'candidate-portrait', 1),
        block('lp-platform', 'content.policy-pillars', 'three-pillar', 2),
        block('lp-bio', 'profile.candidate', 'timeline-bio', 3),
        block('lp-events', 'content.event-list', 'rally-schedule', 4),
        block('lp-volunteer', 'cta.volunteer-signup', 'role-tier', 5),
        block('lp-donate', 'cta.donate', 'amount-tiers', 6),
      ]),
    ],
  },
  extraModules: ['lp.countdown', 'marketing.referral'],
  copyTone: {
    brandVoice: '熱血、改變、與民同行',
    targetAudience: '選區選民、支持者、志工',
    keySellingPoints: [
      '在地深耕、傾聽民意',
      '具體政策、不是口號',
      '一起加入、改變從你我開始',
    ],
  },
};
