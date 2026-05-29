import type { CollectionConfig } from 'payload';

/** 文章 CTA 區塊。 */
export const CtaBlocksCollection: CollectionConfig = {
  slug: 'cta-blocks',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    {
      name: 'placement',
      type: 'select',
      required: true,
      options: [
        { label: '文章內嵌', value: 'inline' },
        { label: '文章結尾', value: 'end-of-post' },
        { label: '側邊欄', value: 'sidebar' },
      ],
    },
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'buttonLabel', type: 'text', required: true },
    { name: 'buttonUrl', type: 'text', required: true },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'weight', type: 'number', defaultValue: 1 },
    { name: 'enabled', type: 'checkbox', defaultValue: true },
  ],
  timestamps: true,
};

/** Lead magnet。 */
export const LeadMagnetsCollection: CollectionConfig = {
  slug: 'lead-magnets',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'fileUrl', type: 'text', required: true },
    { name: 'fileName', type: 'text', required: true },
    { name: 'thumbnailUrl', type: 'text' },
    { name: 'enabled', type: 'checkbox', defaultValue: true },
  ],
  timestamps: true,
};

/** Lead 蒐集紀錄。 */
export const LeadCapturesCollection: CollectionConfig = {
  slug: 'lead-captures',
  admin: { useAsTitle: 'email' },
  access: { update: () => false },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'email', type: 'email', required: true },
    { name: 'name', type: 'text' },
    { name: 'magnetId', type: 'text', required: true, index: true },
    { name: 'sourcePostId', type: 'text' },
    { name: 'ipAddress', type: 'text', admin: { readOnly: true } },
  ],
  timestamps: true,
};

/** Newsletter 訂閱者。 */
export const NewsletterSubscribersCollection: CollectionConfig = {
  slug: 'newsletter-subscribers',
  admin: { useAsTitle: 'email' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'name', type: 'text' },
    { name: 'source', type: 'text' },
    { name: 'confirmed', type: 'checkbox', defaultValue: false },
    { name: 'unsubscribedAt', type: 'date' },
  ],
  timestamps: true,
};

/** 點擊事件追蹤。 */
export const ClickEventsCollection: CollectionConfig = {
  slug: 'marketing-click-events',
  admin: { useAsTitle: 'entityId' },
  access: { update: () => false },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'CTA', value: 'cta' },
        { label: 'Lead magnet', value: 'lead-magnet' },
        { label: '分享', value: 'share' },
      ],
    },
    { name: 'entityId', type: 'text', required: true, index: true },
    { name: 'channel', type: 'text' },
    { name: 'postId', type: 'text', index: true },
  ],
  timestamps: true,
};
