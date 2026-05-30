import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 製造業：CMS 主（公司型錄），LP 輔（產品線）。 */
export const manufacturingTemplate: IndustryTemplate = {
  industry: 'manufacturing',
  primarySiteType: 'cms',
  pages: {
    ...emptyPages(),
    cms: [
      page('homepage', [
        block('home-hero', 'hero.editorial', 'factory-aerial', 1),
        block('home-capabilities', 'features.grid-3', 'capability-card', 2),
        block('home-products', 'product.catalog', 'category-grid', 3),
        block('home-certifications', 'features.grid-3', 'iso-badge', 4),
        block('home-clients', 'social.client-logos', 'logo-strip', 5),
        block('home-contact', 'cta.contact', 'inquiry-form', 6),
      ]),
    ],
  },
  copyTone: {
    brandVoice: '穩重、可信、規格至上',
    targetAudience: '採購、技術部門、貿易商客戶（多為 B2B）',
    keySellingPoints: [
      'ISO 9001 / 14001 國際認證',
      '客製化 OEM / ODM 經驗豐富',
      '台灣 30 年製造、品質穩定',
    ],
  },
};
