import type { CollectionConfig } from 'payload';

/** 企業帳號（B2B）。 */
export const B2BAccountCollection: CollectionConfig = {
  slug: 'course-b2b-accounts',
  admin: { useAsTitle: 'companyName' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'companyName', type: 'text', required: true },
    {
      name: 'domains',
      type: 'array',
      required: true,
      fields: [{ name: 'domain', type: 'text', required: true }],
    },
    { name: 'seatsTotal', type: 'number', required: true },
    { name: 'seatsUsed', type: 'number', required: true, defaultValue: 0 },
    { name: 'contractStartDate', type: 'date', required: true },
    { name: 'contractEndDate', type: 'date', required: true },
    { name: 'ssoConfig', type: 'json' },
    {
      name: 'autoEnrollCourses',
      type: 'array',
      fields: [{ name: 'courseId', type: 'text', required: true }],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: '啟用中', value: 'active' },
        { label: '已暫停', value: 'suspended' },
        { label: '已到期', value: 'expired' },
      ],
    },
  ],
  timestamps: true,
};

/** 企業學員（屬於某 B2BAccount）。 */
export const B2BLearnerCollection: CollectionConfig = {
  slug: 'course-b2b-learners',
  admin: { useAsTitle: 'email' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'b2bAccountId', type: 'text', required: true, index: true },
    { name: 'userId', type: 'text', index: true },
    { name: 'email', type: 'email', required: true, index: true },
    { name: 'name', type: 'text' },
    { name: 'employeeId', type: 'text' },
    { name: 'department', type: 'text', index: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: '啟用中', value: 'active' },
        { label: '未啟用', value: 'inactive' },
        { label: '已離職', value: 'departed' },
      ],
    },
    { name: 'invitedAt', type: 'date', required: true },
    { name: 'activatedAt', type: 'date' },
    {
      name: 'provisioningSource',
      type: 'select',
      required: true,
      options: [
        { label: 'CSV 匯入', value: 'csv-import' },
        { label: 'SSO JIT', value: 'sso-jit' },
        { label: '手動建立', value: 'manual' },
      ],
    },
  ],
  timestamps: true,
};
