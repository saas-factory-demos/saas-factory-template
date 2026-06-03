/**
 * Payload v3 collection（庫存模組，goal 03 §2）。
 */

import type { CollectionConfig } from 'payload';

export const WarehousesCollection: CollectionConfig = {
  slug: 'warehouses',
  admin: { useAsTitle: 'name', group: '庫存' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'priority', type: 'number', defaultValue: 100 },
    { name: 'active', type: 'checkbox', defaultValue: true },
    { name: 'address', type: 'textarea' },
  ],
};

export const InventoryItemsCollection: CollectionConfig = {
  slug: 'inventory-items',
  admin: {
    useAsTitle: 'variantId',
    defaultColumns: ['variantId', 'warehouseId', 'onHand', 'reserved', 'safetyStock'],
    group: '庫存',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'variantId', type: 'relationship', relationTo: 'product-variants', required: true, index: true },
    { name: 'warehouseId', type: 'relationship', relationTo: 'warehouses', required: true, index: true },
    { name: 'onHand', type: 'number', required: true, defaultValue: 0, min: 0 },
    { name: 'reserved', type: 'number', required: true, defaultValue: 0, min: 0 },
    { name: 'safetyStock', type: 'number', defaultValue: 0, min: 0 },
    { name: 'batchNumber', type: 'text' },
    { name: 'expiresAt', type: 'date' },
    {
      name: 'version',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
      admin: { description: '樂觀鎖版本號，CAS 更新時自動 +1。' },
    },
  ],
};

export const InventoryReservationsCollection: CollectionConfig = {
  slug: 'inventory-reservations',
  admin: {
    useAsTitle: 'orderId',
    defaultColumns: ['orderId', 'variantId', 'quantity', 'status', 'expiresAt'],
    group: '庫存',
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'variantId', type: 'text', required: true, index: true },
    { name: 'warehouseId', type: 'text', required: true },
    { name: 'quantity', type: 'number', required: true, min: 1 },
    { name: 'orderId', type: 'text', required: true, index: true },
    { name: 'createdAt', type: 'number', required: true },
    { name: 'expiresAt', type: 'number', required: true, index: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'held',
      options: [
        { label: '預扣中', value: 'held' },
        { label: '已消化', value: 'consumed' },
        { label: '已釋放', value: 'released' },
      ],
    },
  ],
};

export const RestockSubscriptionsCollection: CollectionConfig = {
  slug: 'restock-subscriptions',
  admin: { useAsTitle: 'email', group: '庫存' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'variantId', type: 'text', required: true, index: true },
    { name: 'email', type: 'email', required: true },
    { name: 'createdAt', type: 'date', required: true },
    { name: 'notifiedAt', type: 'date' },
  ],
};
