import type { CollectionConfig } from 'payload';

/** 報名紀錄。 */
export const EnrollmentsCollection: CollectionConfig = {
  slug: 'course-enrollments',
  admin: { useAsTitle: 'id' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'customerId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    { name: 'enrolledAt', type: 'date', required: true },
    { name: 'expiresAt', type: 'date' },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: '購買', value: 'purchase' },
        { label: '贈送', value: 'gift' },
        { label: '訂閱', value: 'subscription' },
        { label: '企業', value: 'enterprise' },
        { label: '手動', value: 'manual' },
        { label: '套裝', value: 'bundle' },
      ],
    },
    { name: 'orderId', type: 'text', index: true },
    { name: 'giftFrom', type: 'text' },
    { name: 'bundleId', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: '有效', value: 'active' },
        { label: '過期', value: 'expired' },
        { label: '撤銷', value: 'revoked' },
      ],
    },
  ],
  timestamps: true,
};

/** 課程套裝。 */
export const CourseBundlesCollection: CollectionConfig = {
  slug: 'course-bundles',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'courseIds', type: 'array', fields: [{ name: 'id', type: 'text' }] },
    { name: 'price', type: 'number', required: true },
    { name: 'enabled', type: 'checkbox', defaultValue: true },
  ],
  timestamps: true,
};

/** 訂閱方案。 */
export const SubscriptionPlansCollection: CollectionConfig = {
  slug: 'course-subscription-plans',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, index: true },
    { name: 'monthlyPrice', type: 'number', required: true },
    { name: 'includedCourseIds', type: 'array', fields: [{ name: 'id', type: 'text' }] },
    { name: 'includedCategoryIds', type: 'array', fields: [{ name: 'id', type: 'text' }] },
    { name: 'enabled', type: 'checkbox', defaultValue: true },
  ],
  timestamps: true,
};
