import type { CollectionConfig } from 'payload';

/**
 * Product Categories collection（Phase 3 多商品擴充）。
 *
 * 樹狀分類（上衣 → T 恤 → 短袖）。設計重點：
 *
 * - **self-relation parent**：每個 category 可指一個父；root 留空
 * - **不做 closure-table / materialized path**：< 100 個類別前用 N+1 recursion 撈樹完全沒問題；
 *   未來商品上千時 cron pre-compute breadcrumb 即可，現在不過度設計
 * - **slug unique 全域**：跨層級也唯一（避免 /products/category/shirts vs
 *   /products/category/men/shirts URL collision）
 *
 * 與 Products 關係：Products.categories[] 是多對一 relationship 陣列
 * （一個商品可掛多分類；例：T恤可能同時在「上衣」「春夏新品」）。
 */
export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'parent', 'orderHint'],
    description: '商品分類樹（多商品電商必備）。slug 全域唯一、parent 留空 = root。',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'URL slug；不可改（會破壞 SEO 索引）' },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'product-categories',
      admin: { description: 'root 留空；不可指自己（前端守門）' },
    },
    {
      name: 'tenantId',
      type: 'text',
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: '類別說明（SEO + 列表頁副標題）' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: '類別封面（首頁分類網格、麵包屑用）' },
    },
    {
      name: 'orderHint',
      type: 'number',
      defaultValue: 100,
      admin: {
        description: '同層級排序權重（小在前）；間距 10 留 insert 空間',
      },
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'false 不顯示但保留資料（暫時下架）' },
    },
  ],
  timestamps: true,
};
