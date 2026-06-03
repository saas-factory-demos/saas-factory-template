import type { CollectionConfig } from 'payload';

/**
 * Discount Rules collection（Phase 6 多商品擴充 — Q3=C 可疊上限 + mutex tags）。
 *
 * 與 @saas-factory/shop-discount-engine 對應；後台維護的規則寫進這個 collection，
 * checkout / cart re-quote 時 query 出來餵 DiscountEngine。
 *
 * Q3=C 配套設計：
 * - category：把折扣分 5 類；same-category 自動「擇優」（取 amount 最大那條），
 *   不同 category 可疊；最多 3 個 category 同時生效（cart-level）。
 * - mutexTags[]：相同 tag 的兩條規則互斥（最多 1 個套用），用於「週年慶折扣」
 *   與「會員折扣」這種設計上不應同時用的場景。
 *
 * 套用順序（DiscountEngine 規則內建）：
 * 1. 篩出 active + 條件滿足 + 在期間內 + 未超限
 * 2. 按 category 分組、各組取 amount 最大那條
 * 3. 走 mutexTags 排除剩餘衝突（保留 priority 最高）
 * 4. 取最後最多 3 個 category 應用
 */
export const DiscountRules: CollectionConfig = {
  slug: 'discount-rules',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'type', 'active', 'priority', 'startsAt', 'endsAt'],
    description: '折扣規則。後台維護的規則餵給 DiscountEngine；Q3=C 同類擇優 + 跨類最多 3。',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: '後台顯示名（用戶看到的可在 displayLabel 設）' },
    },
    {
      name: 'displayLabel',
      type: 'text',
      admin: { description: 'cart / checkout 顯示給用戶的標籤（不填用 name）' },
    },
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      index: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: '自動百分比折扣', value: 'auto-percentage' },
        { label: '自動金額折扣', value: 'auto-amount' },
        { label: '優惠券', value: 'coupon' },
        { label: '運費折扣', value: 'shipping' },
        { label: '組合 / 套組', value: 'bundle' },
      ],
      index: true,
      admin: { description: 'Q3=C：同類擇優、跨類可疊（最多 3 個）' },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: '百分比折扣', value: 'percentage_off' },
        { label: '固定金額折扣', value: 'fixed_off' },
        { label: '免運費', value: 'free_shipping' },
        { label: '買 X 送 Y', value: 'buy_x_get_y' },
        { label: '滿額折', value: 'tiered' },
        { label: '組合折', value: 'bundle' },
        { label: '第 N 件折', value: 'nth_item_off' },
        { label: '贈品', value: 'gift' },
        { label: '首購折', value: 'first_purchase' },
        { label: '訂閱忠誠', value: 'subscription_loyalty' },
      ],
    },
    {
      name: 'params',
      type: 'json',
      admin: {
        description:
          '規則參數 JSON。percentage_off 範例：{percent: 10}；fixed_off：{amount: 100, minSubtotal: 1000}',
      },
    },
    {
      name: 'conditions',
      type: 'json',
      admin: {
        description:
          'DiscountCondition[] JSON 陣列；條件 AND，全 true 才生效。例：[{type: "min_amount", amount: 1500}]',
      },
    },
    {
      name: 'mutexTags',
      type: 'array',
      admin: {
        description: '互斥標籤；相同 tag 的兩條規則最多 1 個生效（保留 priority 最高）',
      },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 50,
      admin: {
        description:
          'mutex 取最高（同類擇優走金額大小）；建議 0-100，週年慶/促銷類用 80+',
      },
    },
    {
      name: 'couponCode',
      type: 'text',
      admin: {
        description: 'category=coupon 時必填；用戶在 checkout 輸入這個碼觸發',
      },
    },
    {
      name: 'maxUses',
      type: 'number',
      min: 0,
      admin: { description: '全域使用次數上限（0 = 不限）' },
    },
    {
      name: 'usedCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { readOnly: true, description: '系統維護' },
    },
    {
      name: 'maxUsesPerUser',
      type: 'number',
      min: 0,
      admin: { description: '同一客戶最多用幾次（0 = 不限）' },
    },
    {
      name: 'startsAt',
      type: 'date',
      admin: { description: '生效時間（不填即時生效）' },
    },
    {
      name: 'endsAt',
      type: 'date',
      admin: { description: '失效時間（不填永久有效）' },
    },
    {
      name: 'stackable',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          '@deprecated 留向後相容；Q3=C 後改靠 category + mutexTags 控制堆疊',
      },
    },
  ],
  timestamps: true,
};
