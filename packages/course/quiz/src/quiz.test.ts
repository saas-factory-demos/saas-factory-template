import { describe, expect, it } from 'vitest';

import { gradeAnswer } from './grading.js';
import { InMemoryQuizStore } from './in-memory-store.js';
import { QuizService, sampleQuestions } from './service.js';

import type { Question, Quiz } from './types.js';

const TENANT = 't1';
const USER = 'u1';

function buildQuiz(overrides: Partial<Quiz> = {}): Quiz {
  return {
    id: 'q1',
    tenantId: TENANT,
    courseId: 'c1',
    title: '小考',
    questions: [
      {
        id: 'sc',
        type: 'single-choice',
        prompt: '台灣首都？',
        options: [
          { key: 'A', text: '高雄' },
          { key: 'B', text: '台北' },
        ],
        correctKeys: ['B'],
      },
      {
        id: 'mc',
        type: 'multiple-choice',
        prompt: '哪些是程式語言？',
        options: [
          { key: 'A', text: 'TypeScript' },
          { key: 'B', text: 'HTML' },
          { key: 'C', text: 'Rust' },
        ],
        correctKeys: ['A', 'C'],
      },
      { id: 'tf', type: 'true-false', prompt: 'Node.js 是 runtime', correctBoolean: true },
      {
        id: 'fb',
        type: 'fill-blank',
        prompt: 'HTTP 預設 port？',
        acceptedAnswers: ['80', 'eighty'],
      },
      { id: 'sa', type: 'short-answer', prompt: '說明 closure。' },
      {
        id: 'mt',
        type: 'matching',
        prompt: '配對',
        pairs: [
          { left: 'TS', right: 'static' },
          { left: 'JS', right: 'dynamic' },
        ],
      },
      {
        id: 'ord',
        type: 'ordering',
        prompt: '排序',
        orderedItems: ['1', '2', '3'],
      },
    ],
    passingScore: 60,
    ...overrides,
  };
}

describe('gradeAnswer', () => {
  const quiz = buildQuiz();
  const q = (id: string): Question => quiz.questions.find((x) => x.id === id) as Question;

  it('single-choice 對錯', () => {
    expect(gradeAnswer(q('sc'), { questionId: 'sc', selectedKeys: ['B'] }).correct).toBe(true);
    expect(gradeAnswer(q('sc'), { questionId: 'sc', selectedKeys: ['A'] }).correct).toBe(false);
  });
  it('multiple-choice 必須完全相符', () => {
    expect(gradeAnswer(q('mc'), { questionId: 'mc', selectedKeys: ['A', 'C'] }).correct).toBe(true);
    expect(gradeAnswer(q('mc'), { questionId: 'mc', selectedKeys: ['A'] }).correct).toBe(false);
    expect(gradeAnswer(q('mc'), { questionId: 'mc', selectedKeys: ['A', 'B', 'C'] }).correct).toBe(
      false,
    );
  });
  it('true-false 比對 boolean', () => {
    expect(gradeAnswer(q('tf'), { questionId: 'tf', booleanValue: true }).correct).toBe(true);
    expect(gradeAnswer(q('tf'), { questionId: 'tf', booleanValue: false }).correct).toBe(false);
  });
  it('fill-blank 大小寫不敏感', () => {
    expect(gradeAnswer(q('fb'), { questionId: 'fb', textValue: '80' }).correct).toBe(true);
    expect(gradeAnswer(q('fb'), { questionId: 'fb', textValue: 'EIGHTY' }).correct).toBe(true);
    expect(gradeAnswer(q('fb'), { questionId: 'fb', textValue: '443' }).correct).toBe(false);
  });
  it('short-answer 標記人工批改', () => {
    const g = gradeAnswer(q('sa'), { questionId: 'sa', textValue: '一段說明' });
    expect(g.correct).toBeNull();
    expect(g.needsManualGrading).toBe(true);
  });
  it('matching 全對才算對', () => {
    expect(
      gradeAnswer(q('mt'), {
        questionId: 'mt',
        matchingMap: { TS: 'static', JS: 'dynamic' },
      }).correct,
    ).toBe(true);
    expect(
      gradeAnswer(q('mt'), {
        questionId: 'mt',
        matchingMap: { TS: 'dynamic', JS: 'static' },
      }).correct,
    ).toBe(false);
  });
  it('ordering 順序必須完全相符', () => {
    expect(
      gradeAnswer(q('ord'), { questionId: 'ord', orderedItems: ['1', '2', '3'] }).correct,
    ).toBe(true);
    expect(
      gradeAnswer(q('ord'), { questionId: 'ord', orderedItems: ['1', '3', '2'] }).correct,
    ).toBe(false);
  });
});

describe('sampleQuestions', () => {
  it('未指定 randomize + 未限制數量 → 原序', () => {
    const qs = buildQuiz().questions;
    expect(sampleQuestions(qs, undefined, false).map((q) => q.id)).toEqual(qs.map((q) => q.id));
  });
  it('sampleCount 截斷', () => {
    const qs = buildQuiz().questions;
    expect(sampleQuestions(qs, 3, false)).toHaveLength(3);
  });
  it('同 seed 結果可重現', () => {
    const qs = buildQuiz().questions;
    const a = sampleQuestions(qs, 5, true, 'seed-x');
    const b = sampleQuestions(qs, 5, true, 'seed-x');
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });
});

describe('QuizService flow', () => {
  it('完整對答 → graded + 及格', async () => {
    const store = new InMemoryQuizStore();
    const svc = new QuizService(store);
    const quiz = buildQuiz({
      questions: buildQuiz().questions.filter((q) => q.type !== 'short-answer'),
    });
    await svc.upsertQuiz(quiz);
    const attempt = await svc.startAttempt({ tenantId: TENANT, quizId: quiz.id, userId: USER });
    const submitted = await svc.submitAttempt({
      attemptId: attempt.id,
      answers: [
        { questionId: 'sc', selectedKeys: ['B'] },
        { questionId: 'mc', selectedKeys: ['A', 'C'] },
        { questionId: 'tf', booleanValue: true },
        { questionId: 'fb', textValue: '80' },
        { questionId: 'mt', matchingMap: { TS: 'static', JS: 'dynamic' } },
        { questionId: 'ord', orderedItems: ['1', '2', '3'] },
      ],
    });
    expect(submitted.status).toBe('graded');
    expect(submitted.score).toBe(100);
    expect(svc.isPassed(submitted, quiz)).toBe(true);
  });

  it('含 short-answer → status = submitted（待人工批改）', async () => {
    const store = new InMemoryQuizStore();
    const svc = new QuizService(store);
    const quiz = buildQuiz();
    await svc.upsertQuiz(quiz);
    const attempt = await svc.startAttempt({ tenantId: TENANT, quizId: quiz.id, userId: USER });
    const submitted = await svc.submitAttempt({
      attemptId: attempt.id,
      answers: [{ questionId: 'sa', textValue: '我的答案' }],
    });
    expect(submitted.status).toBe('submitted');
    expect(submitted.needsManualGrading).toBe(true);
  });

  it('逾時 → status = expired', async () => {
    const store = new InMemoryQuizStore();
    const svc = new QuizService(store);
    const quiz = buildQuiz({ timeLimitSeconds: 60 });
    await svc.upsertQuiz(quiz);
    const start = new Date(2026, 4, 15, 10, 0, 0);
    const attempt = await svc.startAttempt({
      tenantId: TENANT,
      quizId: quiz.id,
      userId: USER,
      now: start,
    });
    const submitted = await svc.submitAttempt({
      attemptId: attempt.id,
      answers: [],
      now: new Date(2026, 4, 15, 10, 5, 0),
    });
    expect(submitted.status).toBe('expired');
  });

  it('超過 retakeLimit → throw', async () => {
    const store = new InMemoryQuizStore();
    const svc = new QuizService(store);
    const quiz = buildQuiz({ retakeLimit: 2 });
    await svc.upsertQuiz(quiz);
    await svc.startAttempt({ tenantId: TENANT, quizId: quiz.id, userId: USER });
    await svc.startAttempt({ tenantId: TENANT, quizId: quiz.id, userId: USER });
    await expect(
      svc.startAttempt({ tenantId: TENANT, quizId: quiz.id, userId: USER }),
    ).rejects.toThrow(/重考次數/);
  });

  it('remainingRetakes 計算正確', async () => {
    const store = new InMemoryQuizStore();
    const svc = new QuizService(store);
    const quiz = buildQuiz({ retakeLimit: 3 });
    await svc.upsertQuiz(quiz);
    await svc.startAttempt({ tenantId: TENANT, quizId: quiz.id, userId: USER });
    expect(await svc.remainingRetakes(TENANT, USER, quiz.id)).toBe(2);
  });
});
