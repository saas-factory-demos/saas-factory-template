import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 不動產：CMS 主（建案展示），LP 輔（單一建案銷售）。 */
export const realestateTemplate: IndustryTemplate = {
  industry: 'realestate',
  primarySiteType: 'cms',
  pages: {
    ...emptyPages(),
    cms: [
      page('homepage', [
        block('home-hero', 'hero.editorial', 'aerial-cinematic', 1),
        block('home-projects', 'category.tiles', 'project-card', 2),
        block('home-features', 'features.grid-3', 'lifestyle-amenity', 3),
        block('home-floorplans', 'gallery.floorplans', 'interactive-tour', 4),
        block('home-location', 'content.location-map', 'transit-amenity', 5),
        block('home-inquiry', 'cta.inquiry', 'visit-booking', 6),
      ]),
    ],
  },
  extraModules: ['lp.sticky-cta'],
  copyTone: {
    brandVoice: '尊榮、地段、永世價值',
    targetAudience: '購屋族、投資客、企業高階主管',
    keySellingPoints: [
      '蛋黃區地段、保值抗跌',
      '頂級建材、知名建築師設計',
      '免費賞屋、專人接送',
    ],
  },
};
