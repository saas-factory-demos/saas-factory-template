/**
 * Payload v3 collection（upsell，goal 03 §11）。
 */

import type { CollectionConfig } from 'payload';

export const OffersCollection: CollectionConfig = {
  slug: 'offers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'placement', 'priority', 'active'],
    group: '行銷',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    {
      name: 'placement',
      type: 'select',
      required: true,
      options: [
        { label: 'Order Bump', value: 'order-bump' },
        { label: 'OTO', value: 'oto' },
        { label: 'Cross-Sell（商品頁）', value: 'cross-sell-pdp' },
        { label: 'Cross-Sell（購物車）', value: 'cross-sell-cart' },
        { label: 'Cross-Sell（結帳頁）', value: 'cross-sell-checkout' },
      ],
    },
    { name: 'variantId', type: 'text', required: true, index: true },
    { name: 'headline', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'price', type: 'number', required: true },
    { name: 'compareAtPrice', type: 'number' },
    { name: 'triggers', type: 'json', required: true },
    { name: 'priority', type: 'number', required: true, defaultValue: 0 },
    { name: 'funnelStep', type: 'number' },
    { name: 'active', type: 'checkbox', required: true, defaultValue: true },
    { name: 'startsAt', type: 'date' },
    { name: 'endsAt', type: 'date' },
  ],
};

export const OfferInteractionsCollection: CollectionConfig = {
  slug: 'offer-interactions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['offerId', 'event', 'occurredAt', 'userId'],
    group: '行銷',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'offerId', type: 'text', required: true, index: true },
    { name: 'userId', type: 'text', index: true },
    { name: 'sessionId', type: 'text', index: true },
    {
      name: 'event',
      type: 'select',
      required: true,
      options: [
        { label: '展示', value: 'shown' },
        { label: '接受', value: 'accepted' },
        { label: '拒絕', value: 'declined' },
      ],
    },
    { name: 'occurredAt', type: 'date', required: true },
  ],
};
