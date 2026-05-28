/**
 * Payload v3 collection（訂閱，goal 03 §12）。
 */

import type { CollectionConfig } from 'payload';

export const SubscriptionsCollection: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['userId', 'status', 'frequency', 'nextRunAt', 'failureCount'],
    group: '訂閱',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'items', type: 'json', required: true },
    {
      name: 'frequency',
      type: 'select',
      required: true,
      options: [
        { label: '週', value: 'weekly' },
        { label: '兩週', value: 'biweekly' },
        { label: '月', value: 'monthly' },
        { label: '季', value: 'quarterly' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: '啟用中', value: 'active' },
        { label: '暫停', value: 'paused' },
        { label: '已取消', value: 'cancelled' },
        { label: '逾期', value: 'past-due' },
      ],
    },
    { name: 'shippingAddress', type: 'json', required: true },
    { name: 'paymentToken', type: 'text', required: true },
    {
      name: 'cardExpiresAt',
      type: 'text',
      required: true,
      admin: { description: 'yyyy-mm' },
    },
    { name: 'discountPercentage', type: 'number' },
    { name: 'nextRunAt', type: 'date', required: true, index: true },
    { name: 'pausedUntil', type: 'date' },
    { name: 'failureCount', type: 'number', required: true, defaultValue: 0 },
    { name: 'lastOrderId', type: 'text', index: true },
  ],
};
