import type { CollectionConfig } from 'payload';

/**
 * Carts collection（Phase 2 多商品擴充）。
 *
 * 多商品電商的購物車。設計重點：
 *
 * 1. **訪客 + 會員統一**：guestSessionId（瀏覽器 cookie 帶）vs user（登入後綁），
 *    任一非空即可。登入時用 sessionId 找 cart 後 UPDATE user = ?，merge 完成。
 *
 * 2. **Line items 帶 variantId + snapshot**：optionValuesSnapshot 凍住「用戶加車時看到的規格」，
 *    避免 product 改名 / 變體下架時購物車炸掉。再 load 時若 variant 不存在會被標 missing。
 *
 * 3. **Status 狀態機**：
 *    active → converted（送出結帳完成）
 *           → abandoned（過 expiresAt 沒結帳，由 cron job 標）
 *
 * 4. **Reserved 庫存追蹤**：當 product.inventoryStrategy='limited' 時，加車立刻 reserve；
 *    cart line 內 reservedUntil 是「鎖庫存到何時」，過期自動 release（在 Products.variants[].reservedStock 上 -=）
 *
 * 5. **Discount snapshot**：appliedDiscounts 凍住加車當下適用的 discount-engine 結果，
 *    避免結帳前折扣規則改動讓金額跳動。結帳時 re-quote 並比對告知。
 *
 * 6. **TTL 14 天**：訪客 / 會員一致；過期 abandoned 後保留 60 天供行銷再行銷。
 */
export const Carts: CollectionConfig = {
  slug: 'carts',
  admin: {
    useAsTitle: 'cartId',
    defaultColumns: [
      'cartId',
      'status',
      'subtotal',
      'currency',
      'user',
      'expiresAt',
      'updatedAt',
    ],
    description: 'Carts（Phase 2 多商品版）。訪客 / 會員統一、variant-aware、過期 abandoned。',
  },
  access: {
    /*
     * Cart 比 Order 寬鬆：訪客 PUT 自己 cart 也要允許（API 端用 cartId + sessionId
     * 驗證）。後台 admin 全權；前端 API route 走 overrideAccess。
     */
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: () => false,
  },
  fields: [
    {
      name: 'cartId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'UUID v4，瀏覽器 cookie 對應；不可改' },
    },
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: { description: '訪客留 null；登入後綁定' },
    },
    {
      name: 'guestSessionId',
      type: 'text',
      index: true,
      admin: {
        description: '訪客時瀏覽器隨機 sessionId，登入後保留但失效（merge 後用 user）',
      },
    },
    {
      name: 'guestEmail',
      type: 'email',
      admin: { description: '訪客 marketing 用；用戶結帳時填過會 prefill' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: '使用中', value: 'active' },
        { label: '已轉成訂單', value: 'converted' },
        { label: '已棄置（過期）', value: 'abandoned' },
      ],
      index: true,
    },
    /*
     * Items：購物車明細。每個 line 帶 productId + variantId + 規格 snapshot。
     *
     * 為何 snapshot 必要：用戶 3 天前加車「紅色 M 號」這個 variant，今天
     * 商家把紅色全下架。沒 snapshot 我們會：(a) 找不到該 variant、(b) 顯示
     * 變成黑色（最近一筆）。snapshot 之後可以顯示「您加購的『紅色 M 號』已
     * 下架，請選其他顏色」。
     */
    {
      name: 'items',
      type: 'array',
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
          admin: { description: '對應 product.variants[].sku' },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
        },
        {
          name: 'optionValuesSnapshot',
          type: 'json',
          admin: {
            description:
              '加車當下凍住的規格組合，例 {"顏色":"紅","尺寸":"M"}',
          },
        },
        {
          name: 'unitPriceSnapshot',
          type: 'number',
          required: true,
          min: 0,
          admin: {
            description: '加車當下單價；結帳時 re-quote 對比，若改動需告知用戶',
          },
        },
        {
          name: 'titleSnapshot',
          type: 'text',
          admin: { description: '加車當下商品名（顯示用，避免重新 JOIN）' },
        },
        {
          name: 'reservedUntil',
          type: 'date',
          admin: {
            description:
              'limited 庫存策略下「鎖庫存到何時」；過期由 cron 釋放並從 cart 移除',
          },
        },
        {
          name: 'addedAt',
          type: 'date',
          admin: { description: '此 line 加車時間（item-level，cart-level updatedAt 另算）' },
        },
      ],
    },
    /*
     * 折扣 snapshot：cart-level 試算結果暫存。
     * 結帳時 discount-engine re-quote，若不一致 UI 提示「價格已更新」。
     */
    {
      name: 'appliedDiscounts',
      type: 'array',
      admin: {
        description: 'discount-engine 套用後 snapshot；結帳 re-quote 時對比',
      },
      fields: [
        { name: 'ruleId', type: 'text', required: true },
        { name: 'ruleTitle', type: 'text' },
        {
          name: 'category',
          type: 'select',
          options: [
            { label: '自動百分比', value: 'auto-percentage' },
            { label: '自動金額', value: 'auto-amount' },
            { label: '優惠券', value: 'coupon' },
            { label: '運費折扣', value: 'shipping' },
            { label: '組合 / 套組', value: 'bundle' },
          ],
        },
        { name: 'discountAmount', type: 'number', min: 0 },
        { name: 'appliedAt', type: 'date' },
      ],
    },
    {
      name: 'couponCode',
      type: 'text',
      admin: { description: '用戶手動輸入的優惠券碼（自動折扣不存這）' },
    },
    /*
     * 金額 cache：每次 cart 改動由 hook 重算寫入。
     * 為何冗存：列表頁過濾「金額 > 1000 的 cart」等查詢可走 SQL，不需 N+1 計算。
     */
    {
      name: 'subtotal',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { readOnly: true },
    },
    {
      name: 'discountTotal',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { readOnly: true },
    },
    {
      name: 'estimatedTotal',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
        description: 'subtotal - discountTotal；不含運費 / 稅，結帳頁才算',
      },
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'TWD',
      options: ['TWD', 'USD', 'JPY', 'EUR', 'CNY', 'HKD', 'SGD'].map((v) => ({
        label: v,
        value: v,
      })),
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        description: 'TTL 14 天；過期由 cron 標 abandoned 並釋放任何 limited 庫存',
      },
    },
    {
      name: 'lastActivityAt',
      type: 'date',
      admin: {
        description:
          '最近一次互動時間（加 / 改 / 移除）；給 abandoned-cart 行銷分群用',
      },
    },
  ],
  timestamps: true,
};
