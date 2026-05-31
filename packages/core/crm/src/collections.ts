import type { CollectionConfig } from 'payload';

/**
 * `CustomerTags` collection。
 *
 * 自訂標籤；source=automated 的標籤由規則引擎自動套用（規則引擎在 goal 07）。
 */
export const CustomerTagsCollection: CollectionConfig = {
  slug: 'customer-tags',
  admin: { useAsTitle: 'name', group: 'CRM' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'color', type: 'text' },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: '手動', value: 'manual' },
        { label: '自動規則', value: 'automated' },
      ],
    },
    { name: 'description', type: 'textarea' },
  ],
};

/**
 * `CustomerSegments` collection。
 *
 * goal 01 階段只存定義；實際 segment 計算由 goal 07 marketing 接手。
 */
export const CustomerSegmentsCollection: CollectionConfig = {
  slug: 'customer-segments',
  admin: { useAsTitle: 'name', group: 'CRM' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'requiredTags',
      type: 'relationship',
      relationTo: 'customer-tags',
      hasMany: true,
    },
    {
      name: 'anyTags',
      type: 'relationship',
      relationTo: 'customer-tags',
      hasMany: true,
    },
    {
      name: 'excludedTags',
      type: 'relationship',
      relationTo: 'customer-tags',
      hasMany: true,
    },
    {
      name: 'lifecycleStages',
      type: 'select',
      hasMany: true,
      options: [
        { label: '新', value: 'new' },
        { label: '活躍', value: 'active' },
        { label: '快流失', value: 'at-risk' },
        { label: '休眠', value: 'dormant' },
        { label: '流失', value: 'lost' },
      ],
    },
  ],
};

/**
 * `CommunicationLog` collection（時間軸 append-only）。
 */
export const CommunicationLogCollection: CollectionConfig = {
  slug: 'communication-log',
  admin: { defaultColumns: ['customerId', 'channel', 'subject', 'occurredAt'], group: 'CRM' },
  access: {
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      index: true,
    },
    {
      name: 'channel',
      type: 'select',
      required: true,
      options: [
        { label: '訂單', value: 'order' },
        { label: '客服', value: 'support' },
        { label: 'Email', value: 'email' },
        { label: 'LINE', value: 'line' },
        { label: 'SMS', value: 'sms' },
        { label: 'Push', value: 'push' },
        { label: '站內訊息', value: 'in-app' },
      ],
    },
    {
      name: 'direction',
      type: 'select',
      required: true,
      defaultValue: 'outbound',
      options: [
        { label: '寄出', value: 'outbound' },
        { label: '收到', value: 'inbound' },
      ],
    },
    { name: 'subject', type: 'text', required: true },
    { name: 'metadata', type: 'json' },
    { name: 'occurredAt', type: 'date', required: true, index: true },
  ],
};
