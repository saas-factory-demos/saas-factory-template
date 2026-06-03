import { randomUUID } from 'node:crypto';

import { gradeAnswer } from './grading.js';

import type {
  AttemptAnswer,
  Question,
  Quiz,
  QuizAttempt,
  QuizStore,
} from './types.js';

export interface StartAttemptInput {
  tenantId: string;
  quizId: string;
  userId: string;
  /** 隨機抽題用的 seed（給回測 / 客服可重現）。 */
  seed?: string;
  now?: Date;
}

export interface SubmitAttemptInput {
  attemptId: string;
  answers: AttemptAnswer[];
  now?: Date;
}

/** 測驗 service：抽題 / 計時 / 評分 / 重考限制。 */
export class QuizService {
  constructor(private readonly store: QuizStore) {}

  upsertQuiz(quiz: Quiz): Promise<void> {
    return this.store.upsertQuiz(quiz);
  }

  /** 開始一次新作答。會檢查重考限制。 */
  async startAttempt(input: StartAttemptInput): Promise<QuizAttempt> {
    const quiz = await this.store.getQuiz(input.quizId);
    if (!quiz) throw new Error(`找不到測驗：${input.quizId}`);
    const prior = await this.store.listAttemptsByUser(input.tenantId, input.userId, quiz.id);
    if (quiz.retakeLimit !== undefined && prior.length >= quiz.retakeLimit) {
      throw new Error(`已達重考次數上限（${quiz.retakeLimit} 次）`);
    }
    const sampled = sampleQuestions(quiz.questions, quiz.sampleCount, quiz.randomize, input.seed);
    const attempt: QuizAttempt = {
      id: randomUUID(),
      tenantId: input.tenantId,
      quizId: quiz.id,
      userId: input.userId,
      questionIds: sampled.map((q) => q.id),
      answers: [],
      status: 'in-progress',
      startedAt: input.now ?? new Date(),
    };
    await this.store.upsertAttempt(attempt);
    return attempt;
  }

  /** 交卷 + 自動評分。Short-answer 題會標記 needsManualGrading。 */
  async submitAttempt(input: SubmitAttemptInput): Promise<QuizAttempt> {
    const attempt = await this.store.getAttempt(input.attemptId);
    if (!attempt) throw new Error(`找不到作答：${input.attemptId}`);
    if (attempt.status !== 'in-progress') {
      throw new Error(`作答已結束（${attempt.status}）`);
    }
    const quiz = await this.store.getQuiz(attempt.quizId);
    if (!quiz) throw new Error(`找不到測驗：${attempt.quizId}`);

    const now = input.now ?? new Date();
    const expired = isExpired(attempt, quiz, now);

    const questionMap = new Map(quiz.questions.map((q) => [q.id, q]));
    const answerMap = new Map(input.answers.map((a) => [a.questionId, a]));

    const grades = attempt.questionIds.map((qid) => {
      const q = questionMap.get(qid);
      if (!q) {
        return { questionId: qid, correct: false, pointsEarned: 0, needsManualGrading: false };
      }
      return gradeAnswer(q, answerMap.get(qid));
    });

    const totalPoints = attempt.questionIds.reduce(
      (sum, qid) => sum + (questionMap.get(qid)?.points ?? 1),
      0,
    );
    const earned = grades.reduce((sum, g) => sum + g.pointsEarned, 0);
    const score = totalPoints > 0 ? (earned / totalPoints) * 100 : 0;
    const needsManualGrading = grades.some((g) => g.needsManualGrading);

    const updated: QuizAttempt = {
      ...attempt,
      answers: input.answers,
      grades,
      score,
      totalPoints,
      needsManualGrading,
      status: expired ? 'expired' : needsManualGrading ? 'submitted' : 'graded',
      submittedAt: now,
    };
    await this.store.upsertAttempt(updated);
    return updated;
  }

  /** 是否及格（依 quiz.passingScore）。需 attempt 已 graded 才能判斷。 */
  isPassed(attempt: QuizAttempt, quiz: Quiz): boolean {
    if (attempt.score === undefined) return false;
    return attempt.score >= (quiz.passingScore ?? 60);
  }

  /** 剩餘可重考次數（undefined = 無限）。 */
  async remainingRetakes(tenantId: string, userId: string, quizId: string): Promise<number | undefined> {
    const quiz = await this.store.getQuiz(quizId);
    if (!quiz?.retakeLimit) return undefined;
    const prior = await this.store.listAttemptsByUser(tenantId, userId, quizId);
    return Math.max(0, quiz.retakeLimit - prior.length);
  }
}

/** 抽題（隨機或固定順序）。 */
export function sampleQuestions(
  questions: Question[],
  sampleCount: number | undefined,
  randomize: boolean | undefined,
  seed?: string,
): Question[] {
  if (!randomize && (sampleCount === undefined || sampleCount >= questions.length)) {
    return questions;
  }
  const rand = makeRand(seed);
  const shuffled = randomize ? shuffle(questions, rand) : questions.slice();
  const n = Math.min(sampleCount ?? questions.length, shuffled.length);
  return shuffled.slice(0, n);
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const ai = a[i] as T;
    const aj = a[j] as T;
    a[i] = aj;
    a[j] = ai;
  }
  return a;
}

function makeRand(seed?: string): () => number {
  if (!seed) return Math.random;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

function isExpired(attempt: QuizAttempt, quiz: Quiz, now: Date): boolean {
  if (!quiz.timeLimitSeconds) return false;
  const elapsed = (now.getTime() - attempt.startedAt.getTime()) / 1000;
  return elapsed > quiz.timeLimitSeconds;
}
