import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 個人品牌：blog 主（內容輸出），CMS / LP 輔。 */
export const personalBrandTemplate: IndustryTemplate = {
  industry: 'personal-brand',
  primarySiteType: 'blog',
  pages: {
    ...emptyPages(),
    blog: [
      page('homepage', [
        block('home-hero', 'hero.editorial', 'author-spotlight', 1),
        block('home-latest', 'blog.latest-posts', 'grid-3', 2),
        block('home-about', 'profile.about-card', 'two-column', 3),
        block('home-newsletter', 'cta.newsletter', 'inline-form', 4),
        block('home-social', 'social.platform-links', 'icon-grid', 5),
        block('home-footer', 'footer.blog', 'minimal', 6),
      ]),
    ],
  },
  copyTone: {
    brandVoice: '真誠、有觀點、像朋友聊天',
    targetAudience: '追隨者、同領域同好者、潛在合作對象',
    keySellingPoints: [
      '深度長文、不譁眾取寵',
      '免費電子報、第一手分享',
      '可預約 1 對 1 諮詢、深度交流',
    ],
  },
};
