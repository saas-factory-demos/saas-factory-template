import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 服飾時尚：shop 主，視覺驅動。 */
export const fashionApparelTemplate: IndustryTemplate = {
  industry: 'fashion-apparel',
  primarySiteType: 'shop',
  pages: {
    ...emptyPages(),
    shop: [
      page('homepage', [
        block('home-hero', 'hero.editorial', 'fullscreen-lookbook', 1),
        block('home-lookbook', 'gallery.lookbook', 'masonry', 2),
        block('home-new-arrival', 'product.featured-grid', 'new-arrival', 3),
        block('home-style-guide', 'content.style-guide', 'magazine-spread', 4),
        block('home-instagram', 'social.instagram-feed', 'grid-6', 5),
        block('home-footer', 'footer.shop', 'multi-column', 6),
      ]),
    ],
  },
  copyTone: {
    brandVoice: '時尚有態度、自信張揚',
    targetAudience: '18-35 歲追求個性與穿搭風格的消費者',
    keySellingPoints: [
      '當季 trend、第一時間入手',
      '搭配建議、整套穿搭',
      '會員專屬折扣與優先購買權',
    ],
  },
};
