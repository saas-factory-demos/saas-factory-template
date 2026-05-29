import type { CollectionConfig } from 'payload';

/**
 * CourseChapters collection（stub）。
 *
 * goal-04（線上課）會擴充：
 * - course relationship（指回 courses collection）
 * - order / 章節排序
 * - 影片 / 教材附件
 * - 試看標記
 *
 * 不可改的契約：id / slug / title。
 */
export const CourseChapters: CollectionConfig = {
  slug: 'course-chapters',
  admin: {
    useAsTitle: 'title',
    description: 'Course chapters（stub）。goal-04 會擴充 course relationship / order / 影片。',
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
  ],
};
