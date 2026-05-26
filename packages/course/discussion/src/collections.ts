import type { CollectionConfig } from 'payload';

/** 討論主題。 */
export const ThreadCollection: CollectionConfig = {
  slug: 'course-threads',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    { name: 'lessonId', type: 'text', index: true },
    { name: 'authorId', type: 'text', required: true, index: true },
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    { name: 'timestampSeconds', type: 'number' },
    { name: 'tags', type: 'json' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: '開放中', value: 'open' },
        { label: '已關閉', value: 'closed' },
        { label: '精華', value: 'featured' },
        { label: '已隱藏', value: 'hidden' },
      ],
    },
    { name: 'upvotes', type: 'number', defaultValue: 0 },
    { name: 'replyCount', type: 'number', defaultValue: 0 },
    { name: 'instructorReplied', type: 'checkbox', defaultValue: false },
    { name: 'hasAcceptedAnswer', type: 'checkbox', defaultValue: false },
  ],
  timestamps: true,
};

/** 討論回覆。 */
export const ReplyCollection: CollectionConfig = {
  slug: 'course-thread-replies',
  admin: { useAsTitle: 'id' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'threadId', type: 'text', required: true, index: true },
    { name: 'parentReplyId', type: 'text', index: true },
    { name: 'authorId', type: 'text', required: true, index: true },
    { name: 'body', type: 'textarea', required: true },
    { name: 'isInstructorReply', type: 'checkbox', defaultValue: false },
    { name: 'isAcceptedAnswer', type: 'checkbox', defaultValue: false },
    { name: 'upvotes', type: 'number', defaultValue: 0 },
  ],
  timestamps: true,
};
