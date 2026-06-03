import type { CollectionConfig } from 'payload';

/** 單元進度紀錄。 */
export const LessonProgressCollection: CollectionConfig = {
  slug: 'course-lesson-progress',
  admin: { useAsTitle: 'lessonId' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'customerId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    { name: 'lessonId', type: 'text', required: true, index: true },
    { name: 'watchedSeconds', type: 'number', defaultValue: 0 },
    { name: 'lastPosition', type: 'number', defaultValue: 0 },
    { name: 'completedAt', type: 'date' },
    { name: 'device', type: 'text' },
    { name: 'lastAccessedAt', type: 'date' },
  ],
  timestamps: true,
};

/** 每日學習統計（streak / 報表）。 */
export const DailyLearningStatsCollection: CollectionConfig = {
  slug: 'course-daily-stats',
  admin: { useAsTitle: 'date' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'customerId', type: 'text', required: true, index: true },
    { name: 'date', type: 'text', required: true, index: true },
    { name: 'seconds', type: 'number', defaultValue: 0 },
    { name: 'lessonsCompleted', type: 'number', defaultValue: 0 },
  ],
};
