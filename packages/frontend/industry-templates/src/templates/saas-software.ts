import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** SaaS 軟體：LP 主（試用註冊），CMS / blog 輔（文件與內容行銷）。 */
export const saasSoftwareTemplate: IndustryTemplate = {
  industry: 'saas-software',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.split', 'product-screenshot', 1),
        block('lp-features', 'features.grid-3', 'icon-title-text', 2),
        block('lp-demo', 'content.product-demo', 'embedded-video', 3),
        block('lp-pricing', 'pricing.tiers', 'three-tier-monthly', 4),
        block('lp-testimonials', 'testimonials.carousel', 'logo-quote', 5),
        block('lp-cta', 'cta.free-trial', 'centered-form', 6),
      ]),
    ],
  },
  extraModules: ['lp.ab-test', 'marketing.segments'],
  copyTone: {
    brandVoice: '專業、直接、效率',
    targetAudience: 'B2B 決策者：產品經理、營運長、技術主管',
    keySellingPoints: [
      '14 天免費試用、無需信用卡',
      'API 完整、與既有系統無縫整合',
      'SOC2 / ISO 認證、企業級資安',
    ],
  },
};
