import type { CollectionConfig } from 'payload';

/** 作業設定。 */
export const AssignmentCollection: CollectionConfig = {
  slug: 'course-assignments',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    { name: 'lessonId', type: 'text', index: true },
    { name: 'title', type: 'text', required: true },
    { name: 'instructions', type: 'textarea' },
    { name: 'dueDate', type: 'date' },
    { name: 'maxFileSizeMB', type: 'number', defaultValue: 50 },
    { name: 'allowedFileTypes', type: 'json' },
    { name: 'allowPeerReview', type: 'checkbox', defaultValue: false },
    { name: 'peerReviewCount', type: 'number', defaultValue: 2 },
    { name: 'showcase', type: 'json' },
    { name: 'maxScore', type: 'number', defaultValue: 100 },
    {
      name: 'gradingScheme',
      type: 'select',
      defaultValue: 'percentage',
      options: [
        { label: '百分比', value: 'percentage' },
        { label: '等第', value: 'letter' },
      ],
    },
  ],
  timestamps: true,
};

/** 學員繳交紀錄。 */
export const SubmissionCollection: CollectionConfig = {
  slug: 'course-submissions',
  admin: { useAsTitle: 'id' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'assignmentId', type: 'text', required: true, index: true },
    { name: 'userId', type: 'text', required: true, index: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '已繳交', value: 'submitted' },
        { label: '批改中', value: 'grading' },
        { label: '已批改', value: 'graded' },
        { label: '需修改', value: 'needs-revision' },
        { label: '已上架作品牆', value: 'published' },
      ],
    },
    { name: 'files', type: 'json' },
    { name: 'textContent', type: 'textarea' },
    { name: 'submittedAt', type: 'date' },
    { name: 'score', type: 'number' },
    { name: 'feedback', type: 'textarea' },
    { name: 'graderId', type: 'text' },
    { name: 'gradedAt', type: 'date' },
    { name: 'peerReviews', type: 'json' },
    { name: 'assignedPeerReviewTargets', type: 'json' },
    { name: 'showcaseOptIn', type: 'checkbox', defaultValue: false },
    { name: 'publishedAt', type: 'date' },
  ],
  timestamps: true,
};
