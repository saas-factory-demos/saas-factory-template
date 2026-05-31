/**
 * Payload v3 collection（訂單模組，goal 03 §7）。
 */

import type { CollectionConfig } from 'payload';

export const OrdersCollection: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'total', 'createdAt'],
    group: '訂單',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'orderNumber', type: 'text', required: true, unique: true, index: true },
    { name: 'userId', type: 'text', index: true },
    { name: 'guestEmail', type: 'email' },
    { name: 'guestPhone', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '待付款', value: 'pending-payment' },
        { label: '已付款', value: 'paid' },
        { label: '備貨中', value: 'preparing' },
        { label: '已出貨', value: 'shipped' },
        { label: '已送達', value: 'delivered' },
        { label: '已完成', value: 'completed' },
        { label: '退款申請', value: 'refund-requested' },
        { label: '已退款', value: 'refunded' },
        { label: '已取消', value: 'cancelled' },
      ],
    },
    { name: 'items', type: 'json', required: true },
    { name: 'currency', type: 'text', required: true, defaultValue: 'TWD' },
    { name: 'subtotal', type: 'number', required: true },
    { name: 'discountTotal', type: 'number', defaultValue: 0 },
    { name: 'shippingFee', type: 'number', defaultValue: 0 },
    { name: 'taxAmount', type: 'number', defaultValue: 0 },
    { name: 'total', type: 'number', required: true },
    { name: 'marketingOptIn', type: 'checkbox', defaultValue: false },
    { name: 'note', type: 'textarea' },
    { name: 'internalNote', type: 'textarea' },
    { name: 'parentOrderId', type: 'text', index: true },
    { name: 'childOrderIds', type: 'json' },
    { name: 'isPreOrder', type: 'checkbox', defaultValue: false },
    { name: 'paymentProvider', type: 'text' },
    { name: 'shippingProvider', type: 'text' },
    { name: 'trackingNumber', type: 'text', index: true },
    { name: 'invoiceId', type: 'text' },
    { name: 'statusHistory', type: 'json' },
  ],
};

export const OrderSequenceCollection: CollectionConfig = {
  slug: 'order-sequences',
  admin: { useAsTitle: 'date', group: '訂單' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'date', type: 'text', required: true, index: true, admin: { description: 'YYYY-MM-DD' } },
    { name: 'lastSeq', type: 'number', required: true, defaultValue: 0 },
  ],
};
