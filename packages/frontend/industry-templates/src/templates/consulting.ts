import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 管理顧問：LP 主（顧問諮詢），CMS / blog 輔。 */
export const consultingTemplate: IndustryTemplate = {
  industry: 'consulting',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.editorial', 'professional-portrait', 1),
        block('lp-services', 'features.grid-3', 'service-card', 2),
        block('lp-case-studies', 'content.case-study', 'logo-result', 3),
        block('lp-team', 'profile.consultant-grid', 'credential-badge', 4),
        block('lp-process', 'content.process-showcase', 'phased', 5),
        block('lp-cta', 'cta.consultation', 'highlighted-form', 6),
      ]),
    ],
  },
  copyTone: {
    brandVoice: '權威、洞察、可信賴',
    targetAudience: '中大型企業高階主管與創業者',
    keySellingPoints: [
      '十年以上業界實戰經驗',
      '客製化策略、不是公版方案',
      '保密協議、商業機密絕對守護',
    ],
  },
};
