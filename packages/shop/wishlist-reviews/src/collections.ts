/**
 * Payload v3 collections（願望清單 + 評價，goal 03 §10）。
 */

import type { CollectionConfig } from 'payload';

export const WishlistsCollection: CollectionConfig = {
  slug: 'wishlists',
  admin: { useAsTitle: 'name', group: '會員' },
  fields: [
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'isDefault', type: 'checkbox', required: true, defaultValue: false },
    { name: 'createdAt', type: 'date', required: true },
  ],
};

export const WishlistItemsCollection: CollectionConfig = {
  slug: 'wishlist-items',
  admin: { useAsTitle: 'variantId', group: '會員' },
  fields: [
    { name: 'wishlistId', type: 'text', required: true, index: true },
    { name: 'variantId', type: 'text', required: true, index: true },
    { name: 'productId', type: 'text', required: true, index: true },
    { name: 'addedAt', type: 'date', required: true },
    { name: 'note', type: 'textarea' },
  ],
};

export const ReviewsCollection: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['productId', 'userId', 'rating', 'visible', 'createdAt'],
    group: '商品',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'orderId', type: 'text', required: true, index: true },
    { name: 'productId', type: 'text', required: true, index: true },
    { name: 'variantId', type: 'text', index: true },
    { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
    { name: 'title', type: 'text' },
    { name: 'body', type: 'textarea', required: true },
    { name: 'photoUrls', type: 'json' },
    { name: 'videoUrls', type: 'json' },
    { name: 'merchantReply', type: 'json' },
    { name: 'visible', type: 'checkbox', required: true, defaultValue: true },
    { name: 'createdAt', type: 'date', required: true },
    { name: 'updatedAt', type: 'date', required: true },
  ],
};

export const ReviewInvitationsCollection: CollectionConfig = {
  slug: 'review-invitations',
  admin: {
    useAsTitle: 'orderId',
    defaultColumns: ['orderId', 'scheduledAt', 'sentAt', 'fulfilled'],
    group: '商品',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'orderId', type: 'text', required: true, index: true },
    { name: 'shippedAt', type: 'date', required: true },
    { name: 'scheduledAt', type: 'date', required: true, index: true },
    { name: 'sentAt', type: 'date' },
    { name: 'fulfilled', type: 'checkbox', required: true, defaultValue: false },
  ],
};
