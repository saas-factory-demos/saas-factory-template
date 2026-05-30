import type { CollectionConfig } from 'payload';

/**
 * 詐刷黑名單 Payload Collection。
 */
export const FraudBlacklistCollection: CollectionConfig = {
  slug: 'fraud-blacklist',
  admin: { useAsTitle: 'value', defaultColumns: ['kind', 'value', 'action', 'expiresAt'] },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Email', value: 'email' },
        { label: '電話', value: 'phone' },
        { label: '卡號 hash', value: 'card-hash' },
        { label: 'IP', value: 'ip' },
      ],
    },
    { name: 'value', type: 'text', required: true, index: true },
    { name: 'reason', type: 'textarea' },
    { name: 'expiresAt', type: 'date' },
    {
      name: 'action',
      type: 'select',
      defaultValue: 'block',
      options: [
        { label: '直接 block', value: 'block' },
        { label: '送人工審核', value: 'review' },
      ],
    },
  ],
  timestamps: true,
};

/**
 * 客戶風險標記 Payload Collection。
 */
export const CustomerRiskMarkCollection: CollectionConfig = {
  slug: 'customer-risk-marks',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'totalOrderCount', 'rejectionRate', 'manualHighRisk'],
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'userId', type: 'text', index: true },
    { name: 'email', type: 'email', index: true },
    { name: 'rejectionCount', type: 'number', required: true, defaultValue: 0 },
    { name: 'totalOrderCount', type: 'number', required: true, defaultValue: 0 },
    { name: 'rejectionRate', type: 'number', required: true, defaultValue: 0 },
    { name: 'manualHighRisk', type: 'checkbox', defaultValue: false },
  ],
  timestamps: true,
};
