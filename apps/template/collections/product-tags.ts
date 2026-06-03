import type { CollectionConfig } from 'payload';

/**
 * Product Tags collection（Phase 3 多商品擴充）。
 *
 * 平面標籤系統。差別於 categories：
 * - **無樹狀**：每個 tag 平面，多對多 with Products
 * - **可重疊**：一個商品可帶多個 tag（春夏 / 新品 / 限量 / 經典款）
 * - **type 區分用途**：style（風格）/ season（季節）/ campaign（活動）/ generic
 *   讓 facet UI 能分組顯示「按風格篩」「按活動篩」
 *
 * Tags 比 categories 更便宜；商品多時走 SQL `IN (?)` 過濾。
 */
export const ProductTags: CollectionConfig = {
  slug: 'product-tags',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'type', 'visible'],
    description: '商品標籤（平面、多對多）。type 決定 facet 分組顯示。',
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
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'generic',
      options: [
        { label: '風格', value: 'style' },
        { label: '季節', value: 'season' },
        { label: '活動', value: 'campaign' },
        { label: '通用', value: 'generic' },
      ],
      index: true,
    },
    {
      name: 'tenantId',
      type: 'text',
      index: true,
    },
    {
      name: 'colorHint',
      type: 'text',
      admin: {
        description: 'UI 顯示色（hex 或 hsl）；不填走預設灰',
      },
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  timestamps: true,
};
