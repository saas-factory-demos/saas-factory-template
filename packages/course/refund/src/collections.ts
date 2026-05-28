import type { CollectionConfig } from 'payload';

/** 退費政策。 */
export const RefundPolicyCollection: CollectionConfig = {
  slug: 'course-refund-policies',
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    {
      name: 'scope',
      type: 'select',
      required: true,
      options: [
        { label: '租戶預設', value: 'tenant' },
        { label: '特定課程', value: 'course' },
      ],
    },
    { name: 'courseId', type: 'text', index: true },
    { name: 'coolingOffDays', type: 'number', required: true, defaultValue: 7 },
    { name: 'maxWatchedRatioForFullRefund', type: 'number', required: true, defaultValue: 0.3 },
    { name: 'allowProRataAfterCoolingOff', type: 'checkbox', required: true, defaultValue: true },
    {
      name: 'proRataBasis',
      type: 'select',
      required: true,
      defaultValue: 'remaining-lessons',
      options: [
        { label: '按未完成單元', value: 'remaining-lessons' },
        { label: '按剩餘天數', value: 'remaining-days' },
      ],
    },
    { name: 'courseDurationDays', type: 'number' },
  ],
  timestamps: true,
};

/** 退費申請。 */
export const RefundRequestCollection: CollectionConfig = {
  slug: 'course-refund-requests',
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'orderId', type: 'text', required: true, index: true },
    { name: 'enrollmentId', type: 'text', required: true, index: true },
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    { name: 'originalAmountMinor', type: 'number', required: true },
    { name: 'refundableMinor', type: 'number', required: true },
    {
      name: 'reason',
      type: 'select',
      required: true,
      options: [
        { label: '鑑賞期退費', value: 'cooling-off' },
        { label: '內容不符', value: 'content-mismatch' },
        { label: '技術問題', value: 'technical-issue' },
        { label: '重複購買', value: 'duplicated-purchase' },
        { label: '其他', value: 'other' },
      ],
    },
    { name: 'reasonText', type: 'textarea' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: '待審核', value: 'pending' },
        { label: '已核准', value: 'approved' },
        { label: '已駁回', value: 'rejected' },
        { label: '已退款', value: 'refunded' },
      ],
    },
    { name: 'invoiceAllowanceId', type: 'text' },
    { name: 'requestedAt', type: 'date', required: true },
    { name: 'processedAt', type: 'date' },
    { name: 'rejectionReason', type: 'textarea' },
  ],
  timestamps: true,
};
