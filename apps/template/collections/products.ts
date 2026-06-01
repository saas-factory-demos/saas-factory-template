import type { CollectionConfig } from 'payload';

/**
 * Products collection（goal-14 A5 擴充版）。
 *
 * 為 shop-pages、shop-checkout、shop-cart 提供 relationship target。schema 從
 * stub（slug + title）升級為「單變體商品」最小可結帳版本：
 *
 * - 價格：unitPrice（minor unit integer，TWD 即元、USD 即分）+ compareAtPrice（劃線價）
 * - 庫存：stock（簡單數字，goal-03 才接 inventory 預扣 / 釋放邏輯）
 * - SKU：唯一 + 索引（對帳、出貨單匹配用）
 * - 圖片：gallery 多張 Media（首張 = 列表縮圖、其餘 = 詳情頁）
 * - 描述：short（列表）+ long（詳情）
 * - status：published / draft / archived
 *
 * 不可改的契約：id / slug / title / unitPrice / currency / status。其他模組
 * （shop-pages、shop-checkout、shop-cart、shop-orders snapshot）已 reference。
 *
 * goal-03 之後要加：variants（規格）/ dimensions / weight / 多幣別 / SEO 欄位 / 標籤。
 */
export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sku', 'unitPrice', 'currency', 'stock', 'status'],
    description: 'Products（單變體版）。複雜變體 / 規格留 goal-03 擴充。',
  },
  access: {
    // 公開讀：行銷頁面要顯示商品（產品列表 / 詳情）；create / update 需登入後台
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
      admin: { description: '網址用 slug；不可改（會破壞已 SEO 索引 / 訂單 reference）' },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: '商品名稱，下訂時 snapshot 到 Order.items[].title' },
    },
    {
      name: 'sku',
      type: 'text',
      unique: true,
      index: true,
      admin: { description: '對帳 / 出貨單匹配用；建議格式 BRAND-CATEGORY-NNN' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'draft', value: 'draft' },
        { label: 'published', value: 'published' },
        { label: 'archived', value: 'archived' },
      ],
      index: true,
    },
    {
      name: 'unitPrice',
      type: 'number',
      required: true,
      min: 0,
      admin: { description: 'minor unit integer（TWD 即元、USD 即分）' },
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      admin: { description: '原價（顯示劃線價用）；不設或 <= unitPrice 則不顯示' },
    },
    {
      name: 'currency',
      type: 'select',
      required: true,
      defaultValue: 'TWD',
      options: ['TWD', 'USD', 'JPY', 'EUR', 'CNY', 'HKD', 'SGD'].map((v) => ({
        label: v,
        value: v,
      })),
    },
    {
      name: 'stock',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description:
          '庫存（簡單數字）。goal-03 會升級為「總庫存 + 預扣量」，此欄位仍代表「可售」量',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      admin: { description: '列表頁簡短說明（80-160 字）' },
    },
    {
      name: 'longDescription',
      type: 'richText',
      admin: { description: '詳情頁長文（圖文混排）' },
    },
    {
      name: 'gallery',
      type: 'array',
      admin: { description: '商品圖；首張 = 列表縮圖、其餘 = 詳情頁輪播' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        { name: 'alt', type: 'text' },
      ],
    },
    {
      name: 'tenantId',
      type: 'text',
      index: true,
      admin: { description: '多租戶：未設則 default tenant（單站客戶最常見）' },
    },
  ],
  timestamps: true,
};
