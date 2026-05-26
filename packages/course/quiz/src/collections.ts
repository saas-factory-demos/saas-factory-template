import type { CollectionConfig } from 'payload';

/** 測驗主檔（含題庫 JSON）。 */
export const QuizCollection: CollectionConfig = {
  slug: 'course-quizzes',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'courseId', type: 'text', required: true, index: true },
    { name: 'lessonId', type: 'text', index: true },
    { name: 'title', type: 'text', required: true },
    { name: 'questions', type: 'json', required: true },
    { name: 'randomize', type: 'checkbox', defaultValue: false },
    { name: 'sampleCount', type: 'number' },
    { name: 'timeLimitSeconds', type: 'number' },
    { name: 'retakeLimit', type: 'number' },
    { name: 'passingScore', type: 'number', defaultValue: 60 },
    { name: 'showCorrectAnswers', type: 'checkbox', defaultValue: true },
  ],
  timestamps: true,
};

/** 一次作答紀錄。 */
export const QuizAttemptCollection: CollectionConfig = {
  slug: 'course-quiz-attempts',
  admin: { useAsTitle: 'id' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'quizId', type: 'text', required: true, index: true },
    { name: 'userId', type: 'text', required: true, index: true },
    { name: 'questionIds', type: 'json' },
    { name: 'answers', type: 'json' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'in-progress',
      options: [
        { label: '進行中', value: 'in-progress' },
        { label: '已提交', value: 'submitted' },
        { label: '已評分', value: 'graded' },
        { label: '已逾時', value: 'expired' },
      ],
    },
    { name: 'startedAt', type: 'date' },
    { name: 'submittedAt', type: 'date' },
    { name: 'score', type: 'number' },
    { name: 'totalPoints', type: 'number' },
    { name: 'grades', type: 'json' },
    { name: 'needsManualGrading', type: 'checkbox', defaultValue: false },
  ],
  timestamps: true,
};
