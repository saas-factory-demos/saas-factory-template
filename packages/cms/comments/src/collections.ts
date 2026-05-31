import type { CollectionConfig } from 'payload';

/**
 * Payload 留言 collection。
 */
export const CommentsCollection: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'postId', 'status', 'createdAt'],
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'postId', type: 'text', required: true, index: true },
    { name: 'parentId', type: 'text' },
    { name: 'authorName', type: 'text', required: true },
    { name: 'authorEmail', type: 'email', required: true },
    { name: 'authorWebsite', type: 'text' },
    { name: 'content', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: '待審核', value: 'pending' },
        { label: '已核准', value: 'approved' },
        { label: '垃圾', value: 'spam' },
        { label: '已拒絕', value: 'rejected' },
      ],
    },
    { name: 'ipAddress', type: 'text', admin: { readOnly: true } },
    { name: 'userAgent', type: 'text', admin: { readOnly: true } },
    {
      name: 'spamReasons',
      type: 'array',
      admin: { readOnly: true },
      fields: [{ name: 'reason', type: 'text' }],
    },
  ],
  timestamps: true,
};
