import type { CollectionConfig } from 'payload';

/** 觀看裝置 session 紀錄。 */
export const DeviceSessionCollection: CollectionConfig = {
  slug: 'course-device-sessions',
  admin: { useAsTitle: 'deviceId' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'deviceId', type: 'text', required: true, index: true },
    { name: 'userAgent', type: 'text' },
    { name: 'ip', type: 'text' },
    { name: 'geoCountry', type: 'text' },
    { name: 'geoCity', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: '使用中', value: 'active' },
        { label: '已撤銷', value: 'revoked' },
        { label: '已過期', value: 'expired' },
      ],
    },
    { name: 'lastSeenAt', type: 'date' },
    { name: 'revokedReason', type: 'text' },
  ],
  timestamps: true,
};
