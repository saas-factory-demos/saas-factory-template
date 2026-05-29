import type { AnswerGrade, AttemptAnswer, Question } from './types.js';

/**
 * 評分單一題目。
 *
 * 回傳 `correct = null` 代表此題需要講師批改（short-answer 或缺資料）。
 */
export function gradeAnswer(question: Question, answer: AttemptAnswer | undefined): AnswerGrade {
  const points = question.points ?? 1;
  const base: AnswerGrade = {
    questionId: question.id,
    correct: false,
    pointsEarned: 0,
    needsManualGrading: false,
  };

  if (!answer) return base;

  switch (question.type) {
    case 'single-choice': {
      const picked = answer.selectedKeys?.[0];
      const ok = !!picked && question.correctKeys?.length === 1 && question.correctKeys[0] === picked;
      return { ...base, correct: ok, pointsEarned: ok ? points : 0 };
    }
    case 'multiple-choice': {
      const picked = new Set(answer.selectedKeys ?? []);
      const correct = new Set(question.correctKeys ?? []);
      const ok = picked.size === correct.size && [...picked].every((k) => correct.has(k));
      return { ...base, correct: ok, pointsEarned: ok ? points : 0 };
    }
    case 'true-false': {
      const ok = answer.booleanValue === question.correctBoolean;
      return { ...base, correct: ok, pointsEarned: ok ? points : 0 };
    }
    case 'fill-blank': {
      const normalize = (s: string) => s.trim().toLowerCase();
      const got = normalize(answer.textValue ?? '');
      const ok = (question.acceptedAnswers ?? []).some((a) => normalize(a) === got);
      return { ...base, correct: ok, pointsEarned: ok ? points : 0 };
    }
    case 'matching': {
      const map = answer.matchingMap ?? {};
      const ok =
        !!question.pairs &&
        question.pairs.length > 0 &&
        question.pairs.every((p) => map[p.left] === p.right);
      return { ...base, correct: ok, pointsEarned: ok ? points : 0 };
    }
    case 'ordering': {
      const items = answer.orderedItems ?? [];
      const target = question.orderedItems ?? [];
      const ok =
        items.length === target.length && items.every((it, i) => it === target[i]);
      return { ...base, correct: ok, pointsEarned: ok ? points : 0 };
    }
    case 'short-answer':
      return { ...base, correct: null, pointsEarned: 0, needsManualGrading: true };
    default:
      return base;
  }
}
