import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 宗教信仰：CMS 主（教會介紹），LP / blog 輔。 */
export const churchReligionTemplate: IndustryTemplate = {
  industry: 'church-religion',
  primarySiteType: 'cms',
  pages: {
    ...emptyPages(),
    cms: [
      page('homepage', [
        block('home-hero', 'hero.editorial', 'sanctuary-serene', 1),
        block('home-welcome', 'content.welcome-message', 'pastor-letter', 2),
        block('home-services', 'content.service-times', 'weekly-schedule', 3),
        block('home-ministries', 'features.grid-3', 'ministry-card', 4),
        block('home-events', 'content.event-list', 'upcoming-list', 5),
        block('home-contact', 'cta.visit-us', 'map-with-address', 6),
      ]),
    ],
  },
  copyTone: {
    brandVoice: '溫暖、平靜、接納',
    targetAudience: '尋找信仰歸屬的個人與家庭',
    keySellingPoints: [
      '友善歡迎初次來訪、不分背景',
      '兒童主日學、家庭一起參與',
      '小組關懷、生命中的同伴',
    ],
  },
};
