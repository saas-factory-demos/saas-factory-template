import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 醫美診所：LP 主（諮詢預約），CMS 輔（衛教）。 */
export const medicalAestheticTemplate: IndustryTemplate = {
  industry: 'medical-aesthetic',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.editorial', 'clinical-portrait', 1),
        block('lp-treatments', 'features.grid-3', 'treatment-card', 2),
        block('lp-doctors', 'profile.doctor-grid', 'credential-badge', 3),
        block('lp-before-after', 'gallery.before-after', 'masonry', 4),
        block('lp-faq', 'faq.accordion', 'two-column', 5),
        block('lp-consultation', 'cta.consultation', 'highlighted-form', 6),
      ]),
    ],
  },
  extraModules: ['lp.sticky-cta', 'lp.countdown'],
  copyTone: {
    brandVoice: '專業安心、低調奢華',
    targetAudience: '30-55 歲願意投資外貌與保養的中高收入族群',
    keySellingPoints: [
      '皮膚科專科醫師親自診療',
      '原廠儀器與療程、安全可追蹤',
      '免費 1 對 1 諮詢、個人化療程',
    ],
  },
};
