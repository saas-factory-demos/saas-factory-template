import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 非營利組織：LP 主（捐款），CMS / blog 輔（議題教育）。 */
export const nonprofitTemplate: IndustryTemplate = {
  industry: 'nonprofit',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.editorial', 'impact-portrait', 1),
        block('lp-mission', 'content.manifesto', 'centered-bold', 2),
        block('lp-impact', 'content.impact-stats', 'big-numbers', 3),
        block('lp-stories', 'testimonials.carousel', 'beneficiary-story', 4),
        block('lp-transparency', 'content.financial-transparency', 'pie-chart', 5),
        block('lp-donate', 'cta.donate', 'amount-tiers', 6),
      ]),
    ],
  },
  extraModules: ['marketing.referral'],
  copyTone: {
    brandVoice: '溫暖、希望、改變正在發生',
    targetAudience: '有社會意識、願意付出的個人與企業',
    keySellingPoints: [
      '每筆捐款 95% 用於受益對象',
      '年度透明財報、可下載查閱',
      '可指定議題、看見實際改變',
    ],
  },
};
