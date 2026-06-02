import type { CollectionConfig } from 'payload';

/**
 * Subscriptions collection（B2）。
 *
 * 訂閱記錄。一個 user / guest email 可以有多筆 active 訂閱（不同方案）。
 *
 * 設計重點：
 * - providerSubscriptionId 由各家 provider 給（藍新 / Stripe），unique
 * - 第一期成功扣款後 status 從 pending → active；後續每期到 nextBillingAt 由
 *   provider webhook 觸發、寫一筆 Payment 並更新 nextBillingAt
 * - status 機制：
 *   pending → active → cancelled
 *           → paused
 *   active 中若連續扣款失敗 N 次（後續 milestone）→ paused
 *
 * 不可改的契約：id / providerSubscriptionId / tenantId / status。其他模組
 * （ledger / membership-tier / 帳單通知）已 reference。
 */

const SUBSCRIPTION_STATUSES = ['pending', 'active', 'paused', 'cancelled', 'failed'] as const;

const PAYMENT_PROVIDERS = [
  'newebpay',
  'ecpay',
  'linepay-official',
  'jkopay-official',
  'tappay',
  'stripe',
  'paypal',
] as const;

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'providerSubscriptionId',
    defaultColumns: [
      'providerSubscriptionId',
      'provider',
      'status',
      'amount',
      'currency',
      'interval',
      'nextBillingAt',
    ],
    description: '訂閱記錄（B2）。每期扣款 webhook 觸發後寫 Payment + 更新 nextBillingAt。',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: () => false,
  },
  fields: [
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
      admin: { description: '訪客訂閱留 null，用 guestEmail 聯絡' },
    },
    { name: 'guestEmail', type: 'email' },
    { name: 'guestPhone', type: 'text' },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      admin: { description: '對應 Products（須為 isSubscription=true 商品）' },
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      options: PAYMENT_PROVIDERS.map((v) => ({ label: v, value: v })),
      index: true,
    },
    {
      name: 'providerSubscriptionId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'provider 那邊的訂閱 id（藍新 MerOrderNo 系列、Stripe sub_...）' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: SUBSCRIPTION_STATUSES.map((v) => ({ label: v, value: v })),
      index: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: { description: '每期扣款金額（minor unit integer）' },
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
      name: 'interval',
      type: 'select',
      required: true,
      options: [
        { label: 'day', value: 'day' },
        { label: 'week', value: 'week' },
        { label: 'month', value: 'month' },
        { label: 'year', value: 'year' },
      ],
    },
    {
      name: 'intervalCount',
      type: 'number',
      required: true,
      defaultValue: 1,
      min: 1,
      admin: { description: '每幾個 interval 扣一次；例 interval=month + intervalCount=3 = 每 3 個月' },
    },
    {
      name: 'nextBillingAt',
      type: 'date',
      admin: { description: '下次扣款預定時間（provider webhook 更新）' },
    },
    {
      name: 'lastPaymentAt',
      type: 'date',
      admin: { description: '最近一次扣款成功時間' },
    },
    {
      name: 'cancelledAt',
      type: 'date',
      admin: { description: 'status=cancelled 時的時間（保留歷史）' },
    },
    {
      name: 'cancelReason',
      type: 'text',
    },
    {
      name: 'rawPayload',
      type: 'json',
      admin: { description: '建訂閱時 provider 回傳的完整 payload；debug 用' },
    },
  ],
  timestamps: true,
};
