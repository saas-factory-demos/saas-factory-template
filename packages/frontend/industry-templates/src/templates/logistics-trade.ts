import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 物流貿易：LP 主（詢價），CMS 輔（公司介紹）。 */
export const logisticsTradeTemplate: IndustryTemplate = {
  industry: 'logistics-trade',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.split', 'cargo-warehouse', 1),
        block('lp-services', 'features.grid-3', 'service-card', 2),
        block('lp-coverage', 'content.coverage-map', 'world-map', 3),
        block('lp-tracking', 'content.tracking-demo', 'mock-ui', 4),
        block('lp-clients', 'social.client-logos', 'logo-strip', 5),
        block('lp-quote', 'cta.quote-form', 'multi-step', 6),
      ]),
    ],
  },
  copyTone: {
    brandVoice: '可靠、全球佈局、即時掌握',
    targetAudience: '進出口貿易商、跨境電商、企業採購',
    keySellingPoints: [
      '全球 200+ 國家報關清關',
      '即時貨況追蹤、API 串接',
      '專業關務、海空運陸運整合',
    ],
  },
};
