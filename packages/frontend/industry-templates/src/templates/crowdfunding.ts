import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 群眾募資：LP 主（募資頁），course 輔（線下回饋活動）。 */
export const crowdfundingTemplate: IndustryTemplate = {
  industry: 'crowdfunding',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.split', 'product-demo-video', 1),
        block('lp-progress', 'content.funding-progress', 'bar-with-countdown', 2),
        block('lp-story', 'content.brand-story', 'video-story', 3),
        block('lp-rewards', 'pricing.tiers', 'reward-tier', 4),
        block('lp-faq', 'faq.accordion', 'common-concerns', 5),
        block('lp-cta', 'cta.back-now', 'sticky-bottom', 6),
      ]),
    ],
  },
  extraModules: ['lp.countdown', 'lp.ab-test', 'marketing.referral'],
  copyTone: {
    brandVoice: '熱血、改變世界、一起完成',
    targetAudience: '早鳥支持者、社群分享者、嘗鮮族',
    keySellingPoints: [
      '早鳥限量超殺折扣',
      '參與者專屬名牌、感謝信',
      '社群同步開發進度、不黑箱',
    ],
  },
};
