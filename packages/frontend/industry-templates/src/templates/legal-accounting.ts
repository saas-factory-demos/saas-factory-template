import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 法律會計：LP 主（諮詢），CMS / blog 輔（專業文章）。 */
export const legalAccountingTemplate: IndustryTemplate = {
  industry: 'legal-accounting',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.editorial', 'office-professional', 1),
        block('lp-services', 'features.grid-3', 'service-card', 2),
        block('lp-partners', 'profile.partner-grid', 'credential-badge', 3),
        block('lp-case-studies', 'content.case-study', 'anonymized-result', 4),
        block('lp-faq', 'faq.accordion', 'common-questions', 5),
        block('lp-consultation', 'cta.consultation', 'confidential-form', 6),
      ]),
    ],
  },
  extraModules: ['lp.sticky-cta'],
  copyTone: {
    brandVoice: '專業、嚴謹、值得託付',
    targetAudience: '中小企業主、創業者、高資產個人',
    keySellingPoints: [
      '20 年以上資深律師／會計師',
      '一站式法務 / 稅務 / 商業諮詢',
      '保密承諾、不洩漏客戶資訊',
    ],
  },
};
