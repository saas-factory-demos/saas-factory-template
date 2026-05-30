import { buildBlockDrivenCollection } from '@saas-factory/cms-pages';

import type { CollectionConfig } from 'payload';

/**
 * ShopPages collection。
 *
 * 給商品 landing page / 行銷活動頁 / 商品策展頁使用。
 * - product：relationship → products（選填，可純策展頁不綁單一商品）
 * - layout：blocks-library BLOCK_REGISTRY 自動產生 Block[]
 * - versions + drafts + i18n（title / layout / seo）
 */
export const ShopPages: CollectionConfig = buildBlockDrivenCollection({
  slug: 'shop-pages',
  description: 'Shop pages（商品 LP / 策展 / 行銷活動）',
  defaultColumns: ['title', 'slug', 'status', 'product'],
  extraFields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      admin: { description: '綁定單一商品（選填）。策展頁可留空。' },
    },
  ],
});
