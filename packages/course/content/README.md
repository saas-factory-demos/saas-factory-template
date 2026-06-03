# @saas-factory/course-content

課程內容核心：Courses + Chapters + Lessons + 募資／預售／早鳥定價。

## 功能

- Course / Chapter / Lesson 三層結構
- 7 種 lesson 類型：video / audio / text / pdf / quiz / assignment / live
- 課程狀態：draft / crowdfunding / presale / live / archived
- 募資推進與達標自動轉 live
- 早鳥定價（含截止時間）
- 整章免費試看 + 單元免費試看
- totalDuration / totalLessons 自動計算
- Payload Collection 4 個：courses / chapters / lessons / course-categories

## 用法

```ts
import { CourseContentService, InMemoryCourseContentStore } from '@saas-factory/course-content';

const svc = new CourseContentService(new InMemoryCourseContentStore());
const course = await svc.upsertCourse({
  tenantId: 't1',
  title: 'TypeScript 入門',
  slug: 'ts-intro',
  type: 'video',
  status: 'live',
  pricing: { mode: 'one-time', price: 1990, earlyBirdPrice: 1490 },
});
const ch = await svc.upsertChapter({ tenantId: 't1', courseId: course.id, title: 'ch1', order: 1 });
await svc.upsertLesson({
  tenantId: 't1', courseId: course.id, chapterId: ch.id,
  title: 'lesson 1', type: 'video', content: { videoId: 'v1' }, duration: 600, order: 1,
});
```
