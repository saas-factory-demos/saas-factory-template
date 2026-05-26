/**
 * Payload v3 collection（優惠券模組，goal 03 §6）。
 */

import type { CollectionConfig } from 'payload';

export const CouponsCollection: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'mode', 'source', 'active', 'startsAt', 'endsAt'],
    group: '行銷',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    {
      name: 'mode',
      type: 'select',
      required: true,
      options: [
        { label: '自動套用', value: 'auto' },
        { label: '單一 code', value: 'code' },
        { label: '大量 code', value: 'bulk' },
      ],
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'campaign',
      options: [
        { label: '行銷活動', value: 'campaign' },
        { label: '推薦', value: 'referral' },
        { label: '補償', value: 'compensation' },
        { label: '訂閱', value: 'subscription' },
        { label: '手動', value: 'manual' },
      ],
    },
    { name: 'rule', type: 'json', required: true },
    { name: 'code', type: 'text', index: true, admin: { description: 'mode 為 code 時必填' } },
    { name: 'totalUsageLimit', type: 'number' },
    { name: 'totalUsageCount', type: 'number', required: true, defaultValue: 0 },
    { name: 'active', type: 'checkbox', required: true, defaultValue: true },
    { name: 'startsAt', type: 'date' },
    { name: 'endsAt', type: 'date' },
  ],
};

export const CouponCodesCollection: CollectionConfig = {
  slug: 'coupon-codes',
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'couponId', 'assignedUserId', 'redeemedAt', 'active'],
    group: '行銷',
  },
  fields: [
    { name: 'couponId', type: 'text', required: true, index: true },
    { name: 'code', type: 'text', required: true, unique: true, index: true },
    { name: 'assignedUserId', type: 'text', index: true },
    { name: 'redeemedAt', type: 'date' },
    { name: 'redeemedByUserId', type: 'text', index: true },
    { name: 'redeemedOrderId', type: 'text', index: true },
    { name: 'active', type: 'checkbox', required: true, defaultValue: true },
  ],
};
