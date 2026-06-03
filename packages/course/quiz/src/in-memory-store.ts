import type { Quiz, QuizAttempt, QuizStore } from './types.js';

/** 記憶體版 QuizStore（測試 / dev）。 */
export class InMemoryQuizStore implements QuizStore {
  private readonly quizzes = new Map<string, Quiz>();
  private readonly attempts = new Map<string, QuizAttempt>();

  async getQuiz(id: string): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }
  async upsertQuiz(q: Quiz): Promise<void> {
    this.quizzes.set(q.id, q);
  }
  async getAttempt(id: string): Promise<QuizAttempt | undefined> {
    return this.attempts.get(id);
  }
  async upsertAttempt(a: QuizAttempt): Promise<void> {
    this.attempts.set(a.id, a);
  }
  async listAttemptsByUser(
    tenantId: string,
    userId: string,
    quizId: string,
  ): Promise<QuizAttempt[]> {
    return Array.from(this.attempts.values()).filter(
      (a) => a.tenantId === tenantId && a.userId === userId && a.quizId === quizId,
    );
  }
}
