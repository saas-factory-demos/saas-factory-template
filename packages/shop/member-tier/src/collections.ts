/**
 * Payload v3 collection（會員等級，goal 03 §8）。
 */

import type { CollectionConfig } from 'payload';

export const MemberTiersCollection: CollectionConfig = {
  slug: 'member-tiers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'rank', 'discountPercentage', 'pointsMultiplier', 'active'],
    group: '會員',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'rank', type: 'number', required: true },
    { name: 'conditions', type: 'json', required: true },
    { name: 'discountPercentage', type: 'number' },
    { name: 'pointsMultiplier', type: 'number' },
    { name: 'freeShippingThreshold', type: 'number' },
    { name: 'notifyOnChange', type: 'checkbox', required: true, defaultValue: true },
    { name: 'active', type: 'checkbox', required: true, defaultValue: true },
  ],
};

export const MemberTierStatusCollection: CollectionConfig = {
  slug: 'member-tier-status',
  admin: {
    useAsTitle: 'userId',
    defaultColumns: ['userId', 'tierId', 'enteredAt', 'totalSpend', 'orderCount'],
    group: '會員',
  },
  fields: [
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'tierId', type: 'text', index: true },
    { name: 'enteredAt', type: 'date', required: true },
    { name: 'nextReviewAt', type: 'date', required: true },
    { name: 'totalSpend', type: 'number', required: true, defaultValue: 0 },
    { name: 'orderCount', type: 'number', required: true, defaultValue: 0 },
  ],
};
