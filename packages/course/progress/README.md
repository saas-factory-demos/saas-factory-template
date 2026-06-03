# @saas-factory/course-progress

學習進度追蹤模組。

## 功能

- 單元進度（watchedSeconds / lastPosition）跨裝置同步
- 完課判定（依 lessonDuration + watchPercentage 閾值）
- 課程整體進度（completedLessons / totalLessons / percentage / isCompleted）
- 每日學習統計（DailyLearningStat）
- 連續學習天數（streak）
- 期間總結（getRangeTotal）

## 用法

```ts
import { InMemoryProgressStore, ProgressService } from '@saas-factory/course-progress';

const svc = new ProgressService(new InMemoryProgressStore());
await svc.recordWatch({
  tenantId: 't1', customerId: 'c1', courseId: 'cr1', lessonId: 'l1',
  secondsDelta: 60, currentPosition: 60, lessonDuration: 600, watchPercentage: 80,
});
const summary = await svc.getCourseProgress('t1', 'c1', 'cr1', {
  lessonDurations: { l1: 600, l2: 600 },
  watchPercentage: 80,
});
```
