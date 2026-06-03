import type { CollectionConfig } from 'payload';

/** 直播議程紀錄。 */
export const LiveSessionCollection: CollectionConfig = {
  slug: 'course-live-sessions',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    { name: 'lessonId', type: 'text', index: true },
    {
      name: 'providerType',
      type: 'select',
      required: true,
      options: [
        { label: 'Zoom', value: 'zoom' },
        { label: 'Google Meet', value: 'google-meet' },
        { label: 'Jitsi', value: 'jitsi' },
      ],
    },
    { name: 'externalId', type: 'text', required: true, index: true },
    { name: 'hostUserId', type: 'text', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'scheduledAt', type: 'date', required: true },
    { name: 'durationMinutes', type: 'number', required: true },
    { name: 'joinUrl', type: 'text' },
    { name: 'startUrl', type: 'text' },
    { name: 'recordings', type: 'json' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'scheduled',
      options: [
        { label: '已排程', value: 'scheduled' },
        { label: '進行中', value: 'live' },
        { label: '已結束', value: 'ended' },
        { label: '已取消', value: 'cancelled' },
      ],
    },
    { name: 'endedAt', type: 'date' },
  ],
  timestamps: true,
};
