import type { CollectionConfig } from 'payload';

/**
 * Products collection（Phase 1 多商品版）。
 *
 * 從「單變體版」（unitPrice / stock 直接在 product 上）升級為「多變體版」：
 * unitPrice / stock / sku / image 都搬到 variants[]，product 級保留 title /
 * description / gallery / category / tags 這類「整商品共用」資訊。
 *
 * 為何不另開 ProductVariants collection：
 * - variants 數量通常 < 30 個（顏色 5 × 尺寸 5 = 25）
 * - 99% 情境一起載入（看商品同時看可選規格）
 * - Payload array field 已有 unique 驗證 + 後台 UI 拖拉排序
 * - 額外 collection 帶來 1-N JOIN 成本，沒人會單看 variant 不看 product
 *
 * 設計重點：
 * - optionDefs[]：定義可選規格的「鍵」（顏色 / 尺寸 / 容量）+ 候選值
 * - variants[]：每個變體實例。一個 variant 對應 optionDefs 的一個值組合
 *   （例：{顏色: '紅', 尺寸: 'M'} → 一個 variant）
 * - 變體欄位：sku unique / unitPrice / compareAtPrice / stock / image
 * - 向後相容：保留 product 級 unitPrice / sku 作為「第一個 variant 的鏡像」，
 *   只有 1 個 variant 時 product.unitPrice == variants[0].unitPrice
 *
 * inventoryStrategy（Q2 鬆綁）：
 * - 'normal'（預設）：結帳開始 reserve，15min TTL 後 release
 * - 'limited'：加車立刻 reserve，30min TTL（搶購、限量、聯名）
 *
 * 不可改的契約：id / slug / title / variants[].sku / variants[].id / status。
 * 已被 Cart / Order / Inventory / Subscription 多處 reference。
 */
export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sku', 'unitPrice', 'currency', 'status'],
    description: 'Products（多變體版）。variants[] 為主，product 級欄位是首個 variant 的鏡像。',
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
          '@deprecated 多變體商品請用 variants[].stock；單變體商品保留方便列表查詢與排序',
      },
    },
    {
      name: 'inventoryStrategy',
      type: 'select',
      required: true,
      defaultValue: 'normal',
      options: [
        { label: '常規（結帳開始扣，15min TTL）', value: 'normal' },
        { label: '限量（加車即扣，30min TTL，搶購用）', value: 'limited' },
      ],
      admin: {
        description: '影響 InventoryReserver 行為；限量商品防囤車、常規商品防庫存過鎖',
      },
    },
    /*
     * Product 級鏡像欄位（向後相容 + 列表頁好用）：
     *
     * 多變體商品的 unitPrice / sku / stock 真正存在 variants[]，但保留 product 級
     * 鏡像以便：(a) 列表頁 SQL 查詢直接過濾排序、(b) 訂閱 / single-variant 商品
     * 寫起來簡單、(c) 舊資料 migrate 不破壞既有 reference。
     *
     * Hook（goal-03 上線時補）：variants[0] 變動時自動同步到這 3 個欄位。本 phase
     * 先靠 admin 手動維護（多變體商品填 variants 也順手填 product 層）。
     */
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
    /*
     * Phase 3：分類 + 標籤關係（多對多）。
     *
     * categories：商品所屬分類，可多選（T 恤可同屬「上衣」「春夏新品」）。facet
     * 過濾 / 列表頁 SQL `WHERE category IN (?)` 用。
     *
     * tags：平面標籤；type 區分（style / season / campaign / generic）給 UI 分組
     * 顯示「按風格篩」「按活動篩」。
     */
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'product-categories',
      hasMany: true,
      admin: { description: '可掛多個分類；空陣列代表「未分類」' },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'product-tags',
      hasMany: true,
      admin: { description: '風格 / 季節 / 活動標籤；facet filter 用' },
    },
    /*
     * Phase 8：Bundle / 組合商品支援。
     *
     * 兩種商品類型：
     * - simple（預設）：真實 SKU、有 variants[]、有 stock
     * - bundle：虛擬商品；不自己有 stock，bundleItems[] 列出組成的 simple products
     *
     * 下單時 bundle 拆解成 N 個 simple line（Order.items[] 帶 isBundleChild =
     * 父 bundle line 的 id）；inventory reserve 對「拆解後的 simple variants」操作。
     *
     * UI 顯示：bundle 在商品列表 / 詳情頁照常顯示自己的 title + 折扣後價格；
     * 加入購物車時 cart 顯示「相機組合 × 1（含相機 + 鏡頭 + 包）」。
     */
    {
      name: 'productType',
      type: 'select',
      required: true,
      defaultValue: 'simple',
      options: [
        { label: '一般商品', value: 'simple' },
        { label: '組合商品（Bundle）', value: 'bundle' },
      ],
      index: true,
    },
    {
      name: 'bundleItems',
      type: 'array',
      admin: {
        condition: (data) => data?.productType === 'bundle',
        description: '組合內容；productType=bundle 才有效；bundle 不自己有 stock',
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'variantSku',
          type: 'text',
          required: true,
          admin: { description: '指定子商品的具體 variant；單變體商品填 variants[0].sku' },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
        },
      ],
    },
    /*
     * 多變體支援（Phase 1 多商品擴充核心）。
     *
     * optionDefs：定義「規格軸」。例：
     *   [{name: '顏色', values: ['紅','白','黑']}, {name: '尺寸', values: ['S','M','L']}]
     *   → 9 個可能 variant 組合
     *
     * variants：實際存在的變體實例。不必窮舉所有組合（某尺寸某色可能沒進貨）。
     * 每個 variant 帶獨立 sku / unitPrice / stock / image。
     *
     * 單變體商品（最常見）：optionDefs 留空、variants 放 1 筆（或全部不填，
     * 用 product 級欄位）。Cart / Order 對「無 variant」狀況做特殊處理。
     */
    {
      name: 'optionDefs',
      type: 'array',
      admin: {
        description: '可選規格定義；單變體商品留空即可',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { description: '規格軸名稱（顏色 / 尺寸 / 容量）' },
        },
        {
          name: 'values',
          type: 'array',
          admin: { description: '此規格軸的所有候選值' },
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'label', type: 'text', admin: { description: '顯示名（不填則同 value）' } },
          ],
        },
      ],
    },
    {
      name: 'variants',
      type: 'array',
      admin: {
        description: '變體實例；單變體商品填 1 筆即可（沿用 product 級 unitPrice / sku）',
      },
      fields: [
        {
          name: 'sku',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: { description: '變體層級 SKU，全域唯一（建議 PARENT-COLOR-SIZE 格式）' },
        },
        {
          name: 'optionValues',
          type: 'json',
          admin: {
            description:
              'snapshot 規格組合，例 {"顏色":"紅","尺寸":"M"}；對應 optionDefs 的 name → value',
          },
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          min: 0,
          admin: { description: '變體層級價格（不同顏色不同價可區分）' },
        },
        {
          name: 'compareAtPrice',
          type: 'number',
          min: 0,
        },
        {
          name: 'stock',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: { description: '此變體當前可售量（InventoryReserver 操作目標）' },
        },
        {
          name: 'reservedStock',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: {
            readOnly: true,
            description: '系統使用：當前被 cart 預扣的量（不可手改、由 reserver 維護）',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { description: '此變體專屬圖；不填則用 product gallery 首張' },
        },
        {
          name: 'weightGrams',
          type: 'number',
          min: 0,
          admin: { description: '運費試算用（gram）；不填用 product 級或預設' },
        },
      ],
    },
    /*
     * B2 訂閱欄位：把單變體商品延伸支援「定期定額」。
     *
     * 為何不另開 SubscriptionPlans collection：藍新 / Stripe 都把訂閱當「週期性商品」
     * 處理，與一次性商品共用 product slug / SKU / 描述，分流只在 checkout / billing
     * 階段。多開 collection 反而要在 Subscriptions / Orders / shop-pages 多個地方
     * 處理「是 product 還是 plan」。
     */
    {
      name: 'isSubscription',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: '勾選後 checkout 不會建一次性 Order，而是建 Subscription' },
    },
    {
      name: 'subscriptionInterval',
      type: 'select',
      defaultValue: 'month',
      options: [
        { label: '日', value: 'day' },
        { label: '週', value: 'week' },
        { label: '月', value: 'month' },
        { label: '年', value: 'year' },
      ],
      admin: { condition: (data) => Boolean(data?.isSubscription) },
    },
    {
      name: 'subscriptionIntervalCount',
      type: 'number',
      defaultValue: 1,
      min: 1,
      admin: {
        condition: (data) => Boolean(data?.isSubscription),
        description: '每幾個 interval 扣一次；例 monthly: 1、quarterly: 3、yearly: 1（同時 interval=year）',
      },
    },
  ],
  timestamps: true,
};
