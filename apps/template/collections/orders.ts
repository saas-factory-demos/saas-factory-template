import type { CollectionConfig } from 'payload';

/**
 * Orders collection（goal-14 scaffolding）。
 *
 * 對應 `@saas-factory/shop-orders` 的 Order 型別 + `@saas-factory/payment-core` 的
 * PaymentMethod / PaymentProviderName。把純 domain 物件落地到 Payload，讓客戶站
 * 後台可以查單 + 改狀態（出貨、退款等）。
 *
 * 設計重點：
 * - items 用 JSON 整包存 snapshot（下單時固定，避免商品改名 / 改價影響舊單）
 * - 金額一律 minor unit integer（TWD 即「元」、USD 即「分」），與 payment-core 一致
 * - 狀態機是 Order.status 欄位 + audit-log，不在 collection 層強制（前端 / API 守門）
 * - 不可改的 schema 契約：id / orderNumber / tenantId / status / total / currency
 *   會被 shop-checkout / payment-router / shop-emails 多處 reference
 *
 * 後續 goal-03 會擴充：發票欄位 / 物流追蹤 / 退款流程明細。
 */

const ORDER_STATUSES = [
  'draft',
  'pending-payment',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'completed',
  'refund-requested',
  'refunded',
  'cancelled',
] as const;

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

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'total', 'currency', 'createdAt'],
    description: 'Orders（goal-14 scaffolding）。對應 shop-orders Order 型別。',
  },
  access: {
    // 訂單僅後台 / 已登入會員（本人）可讀；create 由結帳 API 走 overrideAccess
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: () => false,
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'TW 慣例：YYYYMMDD-NNNN，下單時生成、不可改' },
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
      admin: { description: '訪客結帳留 null；用 guestEmail / guestPhone 聯絡' },
    },
    { name: 'guestEmail', type: 'email' },
    { name: 'guestPhone', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: ORDER_STATUSES.map((v) => ({ label: v, value: v })),
      index: true,
    },
    {
      name: 'items',
      type: 'json',
      required: true,
      admin: {
        description: 'OrderItem[] snapshot；下單時固定（含 title / unitPrice / qty / options）',
      },
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
    { name: 'subtotal', type: 'number', required: true, min: 0 },
    { name: 'discountTotal', type: 'number', required: true, min: 0, defaultValue: 0 },
    { name: 'shippingFee', type: 'number', required: true, min: 0, defaultValue: 0 },
    { name: 'taxAmount', type: 'number', required: true, min: 0, defaultValue: 0 },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
      admin: { description: 'subtotal - discountTotal + shippingFee + taxAmount（一律 minor unit）' },
    },
    {
      name: 'paymentMethod',
      type: 'select',
      options: PAYMENT_METHODS.map((v) => ({ label: v, value: v })),
    },
    {
      name: 'paymentProvider',
      type: 'select',
      options: PAYMENT_PROVIDERS.map((v) => ({ label: v, value: v })),
    },
    {
      name: 'paymentTxnId',
      type: 'text',
      admin: { description: 'payment provider 那邊的交易 id（newebpay TradeNo / stripe pi_）' },
    },
    {
      name: 'marketingOptIn',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'note',
      type: 'textarea',
      admin: { description: '客戶填的訂單備註' },
    },
    {
      name: 'internalNote',
      type: 'textarea',
      admin: { description: '管理員備註（客戶看不到）' },
    },
    {
      name: 'shippingAddress',
      type: 'json',
      admin: { description: '配送地址 snapshot（name / phone / address / city / zip）' },
    },
    {
      name: 'billingAddress',
      type: 'json',
      admin: { description: '帳單地址 snapshot；與 shipping 不同時才填' },
    },
  ],
  timestamps: true,
};
