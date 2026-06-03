# @saas-factory/course-quiz

課程測驗系統：7 題型 + 隨機抽題 + 計時 + 自動評分 + 重考限制。

## 題型

- `single-choice` 單選
- `multiple-choice` 多選（必須完全相符才得分）
- `true-false` 是非
- `fill-blank` 填空（不分大小寫；允許多組可接受答案）
- `short-answer` 簡答（標記 `needsManualGrading = true` 等講師批改）
- `matching` 配對（全部 pair 都對才得分）
- `ordering` 排序（順序完全相符才得分）

## 評分流程

1. `startAttempt()` 抽題（可固定 seed 給客服重現） → 檢查重考限制 → 建 attempt
2. 學員作答 → `submitAttempt()`
3. 自動評分（短答題標記人工）→ 計算總分 → 狀態為 `graded` / `submitted` / `expired`

## 用法

```ts
import { QuizService, InMemoryQuizStore } from '@saas-factory/course-quiz';

const svc = new QuizService(new InMemoryQuizStore());
await svc.upsertQuiz(quiz);

const attempt = await svc.startAttempt({ tenantId: 't1', quizId: 'q1', userId: 'u1' });
const graded = await svc.submitAttempt({ attemptId: attempt.id, answers: [...] });
console.log(graded.score, svc.isPassed(graded, quiz));
```
