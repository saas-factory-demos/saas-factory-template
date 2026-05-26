import type { CollectionConfig } from 'payload';

/** 學員筆記。 */
export const NoteCollection: CollectionConfig = {
  slug: 'course-notes',
  admin: { useAsTitle: 'id' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    { name: 'lessonId', type: 'text', required: true, index: true },
    { name: 'timestampSeconds', type: 'number', required: true },
    { name: 'content', type: 'textarea', required: true },
    {
      name: 'color',
      type: 'select',
      defaultValue: 'yellow',
      options: [
        { label: '黃', value: 'yellow' },
        { label: '綠', value: 'green' },
        { label: '藍', value: 'blue' },
        { label: '紅', value: 'red' },
        { label: '紫', value: 'purple' },
      ],
    },
    { name: 'deviceId', type: 'text' },
    { name: 'deleted', type: 'checkbox', defaultValue: false },
  ],
  timestamps: true,
};
