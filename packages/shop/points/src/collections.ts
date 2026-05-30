/**
 * Payload v3 collection（點數，goal 03 §9）。
 */

import type { CollectionConfig } from 'payload';

export const PointsBatchesCollection: CollectionConfig = {
  slug: 'points-batches',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['userId', 'amount', 'consumed', 'expiresAt', 'expired', 'source'],
    group: '會員',
  },
  fields: [
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'amount', type: 'number', required: true },
    { name: 'consumed', type: 'number', required: true, defaultValue: 0 },
    { name: 'earnedAt', type: 'date', required: true },
    { name: 'expiresAt', type: 'date' },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: '訂單', value: 'order' },
        { label: '手動', value: 'manual' },
        { label: '行銷活動', value: 'campaign' },
      ],
    },
    { name: 'sourceId', type: 'text', index: true },
    { name: 'expired', type: 'checkbox', required: true, defaultValue: false },
  ],
};

export const PointsLedgerCollection: CollectionConfig = {
  slug: 'points-ledger',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['userId', 'delta', 'kind', 'balanceAfter', 'createdAt'],
    group: '會員',
  },
  fields: [
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'delta', type: 'number', required: true },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: '賺點', value: 'earn' },
        { label: '用點', value: 'redeem' },
        { label: '過期', value: 'expire' },
        { label: '手動加', value: 'manual-add' },
        { label: '手動扣', value: 'manual-deduct' },
      ],
    },
    { name: 'balanceAfter', type: 'number', required: true },
    { name: 'orderId', type: 'text', index: true },
    { name: 'operatorUserId', type: 'text' },
    { name: 'reason', type: 'textarea' },
    { name: 'createdAt', type: 'date', required: true },
  ],
};
