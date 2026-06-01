import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 婚禮婚紗：LP 主（諮詢），CMS 輔（作品集）。 */
export const weddingTemplate: IndustryTemplate = {
  industry: 'wedding',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.editorial', 'couple-portrait', 1),
        block('lp-packages', 'pricing.tiers', 'wedding-package', 2),
        block('lp-portfolio', 'gallery.portfolio', 'masonry', 3),
        block('lp-process', 'content.process-showcase', 'step-by-step', 4),
        block('lp-testimonials', 'testimonials.carousel', 'couple-story', 5),
        block('lp-consultation', 'cta.consultation', 'highlighted-form', 6),
      ]),
    ],
  },
  extraModules: ['lp.sticky-cta'],
  copyTone: {
    brandVoice: '浪漫、夢幻、永恆',
    targetAudience: '準備結婚的 25-40 歲新人與雙方家庭',
    keySellingPoints: [
      '一站式服務、婚紗到婚禮全包',
      '資深攝影團隊、捕捉真實感動',
      '客製化禮服、量身專屬婚紗',
    ],
  },
};
