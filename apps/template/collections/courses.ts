import type { CollectionConfig } from 'payload';

/**
 * Courses collection（stub）。
 *
 * 為 course-pages（PR-D）提供 relationship target。goal-04（線上課）會擴充：
 * - chapters relationship（已預埋 course-chapters collection）
 * - 售價 / 試看
 * - 講師 relationship
 * - Bunny.net 影片 metadata
 *
 * 不可改的契約：id / slug / title。
 */
export const Courses: CollectionConfig = {
  slug: 'courses',
  admin: {
    useAsTitle: 'title',
    description: 'Courses（stub）。goal-04 會擴充 chapters / 售價 / 影片 metadata。',
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
};
