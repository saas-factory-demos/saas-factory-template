import type { CollectionConfig } from 'payload';

/** 分潤政策。 */
export const CommissionPolicyCollection: CollectionConfig = {
  slug: 'course-commission-policies',
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    {
      name: 'scope',
      type: 'select',
      required: true,
      options: [
        { label: '租戶預設', value: 'tenant' },
        { label: '特定課程', value: 'course' },
      ],
    },
    { name: 'courseId', type: 'text', index: true },
    { name: 'platformRate', type: 'number', required: true },
    { name: 'instructorRate', type: 'number', required: true },
    { name: 'affiliateL1Rate', type: 'number', required: true, defaultValue: 0 },
    { name: 'affiliateL2Rate', type: 'number', required: true, defaultValue: 0 },
    { name: 'holdDays', type: 'number', required: true, defaultValue: 14 },
  ],
  timestamps: true,
};

/** Affiliate 推薦人。 */
export const AffiliateCollection: CollectionConfig = {
  slug: 'course-affiliates',
  admin: { useAsTitle: 'code' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'code', type: 'text', required: true, unique: true, index: true },
    { name: 'referredByAffiliateId', type: 'text', index: true },
    { name: 'active', type: 'checkbox', required: true, defaultValue: true },
    { name: 'createdAt', type: 'date', required: true },
  ],
  timestamps: true,
};

/** 訂單分潤歸因。 */
export const OrderAttributionCollection: CollectionConfig = {
  slug: 'course-order-attributions',
  fields: [
    { name: 'orderId', type: 'text', required: true, unique: true, index: true },
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'l1AffiliateId', type: 'text', index: true },
    { name: 'l2AffiliateId', type: 'text', index: true },
    { name: 'attributedAt', type: 'date', required: true },
  ],
  timestamps: true,
};

/** 分潤帳目。 */
export const CommissionLedgerCollection: CollectionConfig = {
  slug: 'course-commission-ledger',
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'orderId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    {
      name: 'payeeRole',
      type: 'select',
      required: true,
      options: [
        { label: '平台', value: 'platform' },
        { label: '講師', value: 'instructor' },
        { label: 'L1 推薦人', value: 'affiliate-l1' },
        { label: 'L2 推薦人', value: 'affiliate-l2' },
      ],
    },
    { name: 'payeeId', type: 'text', required: true, index: true },
    { name: 'amountMinor', type: 'number', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'held',
      options: [
        { label: '保留中', value: 'held' },
        { label: '可提領', value: 'available' },
        { label: '已衝銷', value: 'reversed' },
      ],
    },
    { name: 'orderedAt', type: 'date', required: true },
    { name: 'releasesAt', type: 'date', required: true },
  ],
  timestamps: true,
};
