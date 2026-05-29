import { block, courseHomepage, emptyPages, lpHomepage } from './_shared.js';

import type { IndustryTemplate } from '../types.js';

/** 線上課程：course 主，LP 輔（招生頁）。 */
export const onlineCourseTemplate: IndustryTemplate = {
  industry: 'online-course',
  primarySiteType: 'course',
  pages: {
    ...emptyPages(),
    course: [
      courseHomepage(),
      {
        pageKey: 'about-instructor',
        blocks: [
          block('about-hero', 'profile.instructor', 'full-bio', 1),
          block('about-credentials', 'features.grid-3', 'credential-badge', 2),
          block('about-students', 'testimonials.carousel', 'student-story', 3),
          block('about-cta', 'cta.enroll', 'centered', 4),
        ],
      },
    ],
    lp: [lpHomepage('enroll')],
  },
  extraModules: ['course.live', 'lp.countdown'],
  copyTone: {
    brandVoice: '專業、啟發、亦師亦友',
    targetAudience: '想要提升職場技能或興趣轉專業的成人學習者',
    keySellingPoints: [
      '業界實戰講師、不是純理論',
      '永久觀看權、隨時複習',
      '完課證書、加值履歷',
    ],
  },
};
