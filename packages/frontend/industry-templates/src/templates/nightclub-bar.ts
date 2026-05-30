import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 夜店酒吧：LP 主（活動宣傳與訂位），CMS 輔。 */
export const nightclubBarTemplate: IndustryTemplate = {
  industry: 'nightclub-bar',
  primarySiteType: 'lp',
  pages: {
    ...emptyPages(),
    lp: [
      page('landing', [
        block('lp-hero', 'hero.editorial', 'neon-atmosphere', 1),
        block('lp-events', 'content.event-list', 'card-with-dj', 2),
        block('lp-djs', 'profile.dj-grid', 'card-with-spotify', 3),
        block('lp-gallery', 'gallery.party-night', 'masonry', 4),
        block('lp-vip', 'pricing.tiers', 'vip-table-package', 5),
        block('lp-reservation', 'cta.reservation', 'whatsapp-line', 6),
      ]),
    ],
  },
  copyTone: {
    brandVoice: '狂歡、不夜城、解放自我',
    targetAudience: '20-35 歲夜生活愛好者、派對族',
    keySellingPoints: [
      '國際 DJ 駐場、音樂頂規',
      'VIP 桌位包廂、貴賓服務',
      '主題派對每週不同、絕不重複',
    ],
  },
};
