import type { CollectionConfig } from 'payload';

/** LP 頁面。 */
export const LpPageCollection: CollectionConfig = {
  slug: 'lp-pages',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'slug', type: 'text', required: true, index: true },
    { name: 'title', type: 'text', required: true },
    { name: 'blocks', type: 'json', required: true, defaultValue: [] },
    { name: 'seo', type: 'json' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '已發布', value: 'published' },
        { label: '已封存', value: 'archived' },
      ],
    },
    { name: 'publishedAt', type: 'date' },
    { name: 'scheduledPublishAt', type: 'date' },
  ],
  timestamps: true,
};
