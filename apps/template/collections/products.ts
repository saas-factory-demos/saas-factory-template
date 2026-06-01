import type { CollectionConfig } from 'payload';

/**
 * Products collection（stub）。
 *
 * 為 shop-pages（PR-D）提供 relationship target。goal-03（電商）會擴充：
 * - SKU / 變體（variants）
 * - 庫存（inventory）
 * - 價格（price / compareAtPrice / 多幣別）
 * - 圖片 gallery
 * - SEO 欄位
 *
 * 不可改的契約：id / slug / title。其他模組（shop-pages、購物車、訂單）已 reference。
 */
export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    description: 'Products（stub）。goal-03 會擴充 SKU / 庫存 / 價格 / 變體。',
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
};
