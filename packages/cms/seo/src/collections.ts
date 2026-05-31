import type { CollectionConfig } from 'payload';

/** Broken links Payload collection（404 追蹤）。 */
export const BrokenLinksCollection: CollectionConfig = {
  slug: 'broken-links',
  admin: {
    useAsTitle: 'path',
    defaultColumns: ['path', 'hitCount', 'resolved', 'lastSeenAt'],
  },
  access: {
    create: () => false,
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'path', type: 'text', required: true },
    { name: 'referrer', type: 'text' },
    { name: 'hitCount', type: 'number', defaultValue: 1, admin: { readOnly: true } },
    { name: 'resolved', type: 'checkbox', defaultValue: false },
    { name: 'firstSeenAt', type: 'date', admin: { readOnly: true } },
    { name: 'lastSeenAt', type: 'date', admin: { readOnly: true } },
  ],
};
