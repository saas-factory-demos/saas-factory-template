import type { CollectionConfig } from 'payload';

/**
 * Payments collection（goal-14 scaffolding）。
 *
 * 金流交易記錄（log），與 Order 是 1-N（一張訂單可能多次扣款 / 退款 / 重試）。
 * webhook 回來時用 (provider, providerTxnId) 去重，避免重複處理 callback。
 *
 * 狀態機（不在 collection 強制，由 payment-router 守門）：
 * ```
 * pending → succeeded
 *        ↘ failed
 *        ↘ cancelled
 * succeeded → refunded（部分 / 全部）
 * ```
 *
 * 為何分 Order / Payment 兩個 collection：
 * - 退款不會「改 Order 狀態」就完成（要記退款 txn id）
 * - 重試付款（先 ATM 沒入帳，改信用卡）會有 2 筆 Payment 共享 1 個 Order
 * - 對帳：定期跟 newebpay / stripe 拉 ledger 比對，看哪筆 Payment 缺帳
 */

const PAYMENT_STATUSES = ['pending', 'succeeded', 'failed', 'cancelled', 'refunded'] as const;

const PAYMENT_METHODS = [
  'credit',
  'credit-installment',
  'atm',
  'cvs',
  'cvs-barcode',
  'webatm',
  'linepay',
  'jkopay',
  'applepay',
  'googlepay',
  'samsungpay',
  'pi-wallet',
  'easycard',
  'esun-wallet',
  'taiwanpay',
  'stripe-card',
  'paypal',
  'cod',
  'enterprise-transfer',
] as const;

const PAYMENT_PROVIDERS = [
  'newebpay',
  'ecpay',
  'linepay-official',
  'jkopay-official',
  'tappay',
  'stripe',
  'paypal',
] as const;

export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: 'providerTxnId',
    defaultColumns: ['providerTxnId', 'provider', 'status', 'amount', 'currency', 'createdAt'],
    description: 'Payments（goal-14 scaffolding）。對應 payment-core ChargeResult / RefundResult。',
  },
  access: {
    // 僅後台 / 內部服務可讀寫；前端不會直接動這
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: () => false,
  },
  fields: [
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
      index: true,
    },
    {
      name: 'tenantId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      options: PAYMENT_PROVIDERS.map((v) => ({ label: v, value: v })),
      index: true,
    },
    {
      name: 'method',
      type: 'select',
      required: true,
      options: PAYMENT_METHODS.map((v) => ({ label: v, value: v })),
    },
    {
      name: 'providerTxnId',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'provider 那邊的交易 id（去重用，搭 provider 是 unique）' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: PAYMENT_STATUSES.map((v) => ({ label: v, value: v })),
      index: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      admin: { description: 'minor unit integer（TWD 即元、USD 即分）' },
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
      name: 'feeAmount',
      type: 'number',
      min: 0,
      admin: { description: 'provider 收取的手續費（minor unit）；對帳用' },
    },
    {
      name: 'isRefund',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'true 代表這筆是退款 txn（amount 仍為正數）' },
    },
    {
      name: 'parentPayment',
      type: 'relationship',
      relationTo: 'payments',
      admin: { description: '退款 txn 指向被退的原始 Payment' },
    },
    {
      name: 'rawPayload',
      type: 'json',
      admin: { description: 'webhook 收到的完整 body（解密後）；除錯 + 對帳用' },
    },
    {
      name: 'failureCode',
      type: 'text',
      admin: { description: 'provider 回的失敗代碼（status=failed 才有）' },
    },
    {
      name: 'failureMessage',
      type: 'text',
    },
  ],
  timestamps: true,
};
