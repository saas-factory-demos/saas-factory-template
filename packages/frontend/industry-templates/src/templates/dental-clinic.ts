import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 牙醫診所：LP 主（預約），CMS 輔（醫師團隊）。 */
export const dentalClinicTemplate: IndustryTemplate = {
  industry: 'dental-clinic',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.split', 'clinical-friendly', 1),
        block('lp-services', 'features.grid-3', 'service-icon', 2),
        block('lp-doctors', 'profile.doctor-grid', 'card-bio', 3),
        block('lp-facility', 'gallery.facility-tour', 'modern-clinic', 4),
        block('lp-faq', 'faq.accordion', 'common-concerns', 5),
        block('lp-booking', 'cta.booking', 'inline-calendar', 6),
      ]),
    ],
  },
  extraModules: ['lp.sticky-cta'],
  copyTone: {
    brandVoice: '溫和、不痛、安心',
    targetAudience: '怕痛、追求美觀牙齒的全年齡層患者',
    keySellingPoints: [
      '無痛麻醉、舒眠治療',
      '數位口腔掃描、療程透明',
      '夜間與假日門診、配合上班族',
    ],
  },
};
