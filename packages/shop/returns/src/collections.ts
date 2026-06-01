/**
 * Payload v3 collection（退換貨，goal 03 §13）。
 */

import type { CollectionConfig } from 'payload';

export const ReturnRequestsCollection: CollectionConfig = {
  slug: 'return-requests',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['orderId', 'kind', 'status', 'refundAmount', 'createdAt'],
    group: '訂單',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'orderId', type: 'text', required: true, index: true },
    { name: 'exchangeOrderId', type: 'text', index: true },
    { name: 'userId', type: 'text', index: true },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: '退貨', value: 'refund' },
        { label: '換貨', value: 'exchange' },
      ],
    },
    {
      name: 'reason',
      type: 'select',
      required: true,
      options: [
        { label: '商品瑕疵', value: 'defective' },
        { label: '送錯商品', value: 'wrong-item' },
        { label: '尺寸不合', value: 'size-fit' },
        { label: '不再需要', value: 'no-longer-needed' },
        { label: '運送途中損壞', value: 'damaged-in-transit' },
        { label: '其他', value: 'other' },
      ],
    },
    { name: 'reasonDetail', type: 'textarea' },
    { name: 'items', type: 'json', required: true },
    { name: 'refundAmount', type: 'number', required: true },
    {
      name: 'shippingFeePayer',
      type: 'select',
      required: true,
      options: [
        { label: '商家', value: 'merchant' },
        { label: '顧客', value: 'customer' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: '申請中', value: 'pending' },
        { label: '已核可', value: 'approved' },
        { label: '已收到', value: 'received' },
        { label: '已退款', value: 'refunded' },
        { label: '已換貨', value: 'exchanged' },
        { label: '已拒絕', value: 'rejected' },
        { label: '已取消', value: 'cancelled' },
      ],
    },
    { name: 'withinCoolingPeriod', type: 'checkbox', required: true, defaultValue: false },
    { name: 'allowanceId', type: 'text', index: true },
    { name: 'statusHistory', type: 'json', required: true },
  ],
};
