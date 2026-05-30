import { buildBlockDrivenCollection } from '@saas-factory/cms-pages';

import type { CollectionConfig } from 'payload';

/**
 * CoursePages collection。
 *
 * 給線上課 landing page 使用。
 * - course：relationship → courses
 * - layout：blocks-library BLOCK_REGISTRY
 * - versions + drafts + i18n
 */
export const CoursePages: CollectionConfig = buildBlockDrivenCollection({
  slug: 'course-pages',
  description: 'Course landing pages（線上課程行銷頁）',
  defaultColumns: ['title', 'slug', 'status', 'course'],
  extraFields: [
    {
      name: 'course',
      type: 'relationship',
      relationTo: 'courses',
      admin: { description: '綁定線上課（選填）。' },
    },
  ],
});
