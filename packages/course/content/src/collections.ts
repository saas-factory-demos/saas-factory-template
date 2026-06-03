import type { CollectionConfig } from 'payload';

/** 課程主體。 */
export const CoursesCollection: CollectionConfig = {
  slug: 'courses',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, index: true },
    { name: 'descriptionHtml', type: 'textarea' },
    { name: 'shortDescription', type: 'textarea' },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: '影片', value: 'video' },
        { label: '音檔', value: 'audio' },
        { label: '混合', value: 'mixed' },
        { label: '直播', value: 'live' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '募資中', value: 'crowdfunding' },
        { label: '預售中', value: 'presale' },
        { label: '已上架', value: 'live' },
        { label: '已封存', value: 'archived' },
      ],
    },
    { name: 'thumbnail', type: 'text' },
    { name: 'coverImage', type: 'text' },
    { name: 'previewVideoId', type: 'text' },
    {
      name: 'instructorIds',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
    },
    {
      name: 'categoryIds',
      type: 'relationship',
      relationTo: 'course-categories',
      hasMany: true,
    },
    {
      name: 'difficulty',
      type: 'select',
      options: [
        { label: '入門', value: 'beginner' },
        { label: '中階', value: 'intermediate' },
        { label: '進階', value: 'advanced' },
      ],
    },
    { name: 'language', type: 'text', defaultValue: 'zh-TW' },
    {
      name: 'pricing',
      type: 'group',
      fields: [
        {
          name: 'mode',
          type: 'select',
          required: true,
          defaultValue: 'one-time',
          options: [
            { label: '一次性購買', value: 'one-time' },
            { label: '訂閱', value: 'subscription' },
            { label: '套裝', value: 'bundle' },
            { label: '單元購買', value: 'pay-per-lesson' },
          ],
        },
        { name: 'price', type: 'number', required: true },
        { name: 'comparePrice', type: 'number' },
        { name: 'earlyBirdPrice', type: 'number' },
        { name: 'earlyBirdEndsAt', type: 'date' },
        { name: 'crowdfundingGoal', type: 'number' },
        { name: 'crowdfundingCurrent', type: 'number', defaultValue: 0 },
        { name: 'crowdfundingDeadline', type: 'date' },
      ],
    },
    { name: 'outcomes', type: 'array', fields: [{ name: 'text', type: 'text' }] },
    { name: 'suitableFor', type: 'array', fields: [{ name: 'text', type: 'text' }] },
    { name: 'prerequisites', type: 'array', fields: [{ name: 'text', type: 'text' }] },
    {
      name: 'faq',
      type: 'array',
      fields: [
        { name: 'q', type: 'text', required: true },
        { name: 'a', type: 'textarea', required: true },
      ],
    },
    {
      name: 'completionCriteria',
      type: 'group',
      fields: [
        { name: 'watchPercentage', type: 'number', defaultValue: 80 },
        { name: 'quizPassRate', type: 'number', defaultValue: 60 },
      ],
    },
    { name: 'certificateTemplateId', type: 'text' },
    { name: 'enrollmentCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'rating', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'ratingCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'totalDuration', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'totalLessons', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'publishedAt', type: 'date' },
  ],
  timestamps: true,
};

/** 章節。 */
export const ChaptersCollection: CollectionConfig = {
  slug: 'course-chapters',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'order', type: 'number', required: true },
    { name: 'isFree', type: 'checkbox', defaultValue: false },
  ],
  timestamps: true,
};

/** 單元。 */
export const LessonsCollection: CollectionConfig = {
  slug: 'course-lessons',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    { name: 'chapterId', type: 'text', required: true, index: true },
    { name: 'title', type: 'text', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: '影片', value: 'video' },
        { label: '音檔', value: 'audio' },
        { label: '文字', value: 'text' },
        { label: 'PDF', value: 'pdf' },
        { label: '測驗', value: 'quiz' },
        { label: '作業', value: 'assignment' },
        { label: '直播', value: 'live' },
      ],
    },
    {
      name: 'content',
      type: 'group',
      fields: [
        { name: 'videoId', type: 'text' },
        { name: 'audioId', type: 'text' },
        { name: 'html', type: 'textarea' },
        { name: 'pdfUrl', type: 'text' },
        { name: 'quizId', type: 'text' },
        { name: 'assignmentId', type: 'text' },
        { name: 'liveSessionId', type: 'text' },
      ],
    },
    { name: 'duration', type: 'number', defaultValue: 0 },
    { name: 'order', type: 'number', required: true },
    { name: 'isFree', type: 'checkbox', defaultValue: false },
    { name: 'resources', type: 'array', fields: [{ name: 'url', type: 'text' }] },
    { name: 'transcript', type: 'textarea' },
  ],
  timestamps: true,
};

/** 課程分類。 */
export const CourseCategoriesCollection: CollectionConfig = {
  slug: 'course-categories',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
  timestamps: true,
};
