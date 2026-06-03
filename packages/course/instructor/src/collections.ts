import type { CollectionConfig } from 'payload';

/** 觀看事件（流失分析來源）。 */
export const WatchEventCollection: CollectionConfig = {
  slug: 'course-watch-events',
  fields: [
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'lessonId', type: 'text', required: true, index: true },
    { name: 'timestampSeconds', type: 'number', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: ['play', 'pause', 'seek-out', 'completed', 'replay'].map((v) => ({ label: v, value: v })),
    },
    { name: 'occurredAt', type: 'date', required: true },
  ],
  timestamps: true,
};

/** 收益事件（銷售 / 退款）。 */
export const RevenueEventCollection: CollectionConfig = {
  slug: 'course-revenue-events',
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'instructorId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    { name: 'amountMinor', type: 'number', required: true },
    { name: 'platformFeeRate', type: 'number', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: '銷售', value: 'sale' },
        { label: '退款', value: 'refund' },
        { label: '調整', value: 'adjustment' },
      ],
    },
    { name: 'occurredAt', type: 'date', required: true },
  ],
  timestamps: true,
};

/** 提領申請。 */
export const PayoutRequestCollection: CollectionConfig = {
  slug: 'course-payout-requests',
  admin: { useAsTitle: 'id' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'instructorId', type: 'text', required: true, index: true },
    { name: 'amountMinor', type: 'number', required: true },
    {
      name: 'method',
      type: 'select',
      required: true,
      options: [
        { label: '銀行轉帳', value: 'bank-transfer' },
        { label: 'ACH', value: 'ach' },
        { label: 'Wise', value: 'wise' },
      ],
    },
    { name: 'payeeRef', type: 'text', required: true },
    { name: 'invoiceStorageKey', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: '待審核', value: 'pending' },
        { label: '已核准', value: 'approved' },
        { label: '已拒絕', value: 'rejected' },
        { label: '已付款', value: 'paid' },
      ],
    },
    { name: 'requestedAt', type: 'date', required: true },
    { name: 'processedAt', type: 'date' },
    { name: 'rejectionReason', type: 'textarea' },
  ],
  timestamps: true,
};

/** 講師 ↔ 學員私訊。 */
export const DirectMessageCollection: CollectionConfig = {
  slug: 'course-direct-messages',
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'conversationId', type: 'text', required: true, index: true },
    { name: 'fromUserId', type: 'text', required: true, index: true },
    { name: 'toUserId', type: 'text', required: true, index: true },
    {
      name: 'fromRole',
      type: 'select',
      required: true,
      options: [
        { label: '講師', value: 'instructor' },
        { label: '學員', value: 'learner' },
      ],
    },
    { name: 'body', type: 'textarea', required: true },
    { name: 'sentAt', type: 'date', required: true },
    { name: 'readAt', type: 'date' },
  ],
  timestamps: true,
};

/** 課程內容版本快照。 */
export const ContentVersionCollection: CollectionConfig = {
  slug: 'course-content-versions',
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    { name: 'version', type: 'number', required: true },
    { name: 'lessonSnapshots', type: 'json', required: true },
    { name: 'publishedAt', type: 'date', required: true },
    { name: 'changelog', type: 'textarea' },
  ],
  timestamps: true,
};

/** Enrollment 對應的版本鎖定。 */
export const EnrollmentVersionLockCollection: CollectionConfig = {
  slug: 'course-enrollment-version-locks',
  fields: [
    { name: 'enrollmentId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    { name: 'lockedVersion', type: 'number', required: true },
    { name: 'followLatest', type: 'checkbox', required: true, defaultValue: false },
  ],
  timestamps: true,
};
