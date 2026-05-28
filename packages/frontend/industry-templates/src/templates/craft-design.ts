import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 工藝設計：shop 主，CMS 輔（職人故事）。 */
export const craftDesignTemplate: IndustryTemplate = {
  industry: 'craft-design',
  primarySiteType: 'shop',
  pages: {
    ...emptyPages(),
    shop: [
      page('homepage', [
        block('home-hero', 'hero.editorial', 'craftsman-portrait', 1),
        block('home-story', 'content.brand-story', 'editorial', 2),
        block('home-collections', 'product.featured-grid', 'limited-edition', 3),
        block('home-process', 'content.process-showcase', 'step-by-step', 4),
        block('home-press', 'social.press-mentions', 'logo-strip', 5),
        block('home-footer', 'footer.shop', 'minimal', 6),
      ]),
    ],
  },
  copyTone: {
    brandVoice: '質樸、職人魂、慢工出細活',
    targetAudience: '追求獨特性與工藝價值的中高端消費者',
    keySellingPoints: [
      '手工製作、每件獨一無二',
      '台灣設計師原創作品',
      '採用天然材質、永續工藝',
    ],
  },
};
