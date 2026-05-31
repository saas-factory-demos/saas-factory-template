import type { CollectionConfig } from 'payload';

/** 課程結業證書。 */
export const CertificateCollection: CollectionConfig = {
  slug: 'course-certificates',
  admin: { useAsTitle: 'verificationCode' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'learnerName', type: 'text', required: true },
    { name: 'courseTitle', type: 'text', required: true },
    { name: 'completedAt', type: 'date', required: true },
    { name: 'issuedAt', type: 'date', required: true },
    { name: 'verificationCode', type: 'text', required: true, unique: true, index: true },
    { name: 'pdfStorageKey', type: 'text' },
    { name: 'cpeCredits', type: 'number' },
    { name: 'ceuCredits', type: 'number' },
    { name: 'expiresAt', type: 'date' },
    { name: 'issuerName', type: 'text', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'issued',
      options: [
        { label: '已簽發', value: 'issued' },
        { label: '已撤銷', value: 'revoked' },
        { label: '已過期', value: 'expired' },
      ],
    },
    { name: 'revokedReason', type: 'text' },
  ],
  timestamps: true,
};
