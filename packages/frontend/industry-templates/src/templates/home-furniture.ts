import { block, emptyPages, page } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 居家家具：shop 主，CMS 輔（品牌故事與展示間）。 */
export const homeFurnitureTemplate: IndustryTemplate = {
  industry: 'home-furniture',
  primarySiteType: 'shop',
  pages: {
    ...emptyPages(),
    shop: [
      page('homepage', [
        block('home-hero', 'hero.editorial', 'room-scene', 1),
        block('home-collections', 'category.tiles', 'tiles-4', 2),
        block('home-featured', 'product.featured-grid', 'grid-3', 3),
        block('home-room-inspiration', 'gallery.room-inspiration', 'masonry', 4),
        block('home-services', 'features.grid-3', 'icon-title-text', 5),
        block('home-footer', 'footer.shop', 'multi-column', 6),
      ]),
    ],
  },
  copyTone: {
    brandVoice: '質感、生活提案',
    targetAudience: '25-50 歲首購族與升級換家具的家庭',
    keySellingPoints: [
      '原木實木、十年保固',
      '免費丈量與到府安裝',
      '北歐／日式設計、台灣師傅手工',
    ],
  },
};
