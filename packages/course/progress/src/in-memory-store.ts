import type { DailyLearningStat, LessonProgress, ProgressStore } from './types.js';

/** 記憶體實作。 */
export class InMemoryProgressStore implements ProgressStore {
  private readonly lessonProgress = new Map<string, LessonProgress>();
  private readonly dailyStats = new Map<string, DailyLearningStat>();

  private lpKey(t: string, c: string, cr: string, l: string): string {
    return `${t}|${c}|${cr}|${l}`;
  }
  private dsKey(t: string, c: string, d: string): string {
    return `${t}|${c}|${d}`;
  }

  async upsertLessonProgress(p: LessonProgress): Promise<LessonProgress> {
    this.lessonProgress.set(this.lpKey(p.tenantId, p.customerId, p.courseId, p.lessonId), p);
    return p;
  }

  async findLessonProgress(
    tenantId: string,
    customerId: string,
    courseId: string,
    lessonId: string,
  ): Promise<LessonProgress | undefined> {
    return this.lessonProgress.get(this.lpKey(tenantId, customerId, courseId, lessonId));
  }

  async listCourseProgress(
    tenantId: string,
    customerId: string,
    courseId: string,
  ): Promise<LessonProgress[]> {
    return [...this.lessonProgress.values()].filter(
      (p) => p.tenantId === tenantId && p.customerId === customerId && p.courseId === courseId,
    );
  }

  async upsertDailyStat(s: DailyLearningStat): Promise<DailyLearningStat> {
    this.dailyStats.set(this.dsKey(s.tenantId, s.customerId, s.date), s);
    return s;
  }

  async findDailyStat(
    tenantId: string,
    customerId: string,
    date: string,
  ): Promise<DailyLearningStat | undefined> {
    return this.dailyStats.get(this.dsKey(tenantId, customerId, date));
  }

  async listDailyStats(
    tenantId: string,
    customerId: string,
    fromDate: string,
    toDate: string,
  ): Promise<DailyLearningStat[]> {
    return [...this.dailyStats.values()]
      .filter(
        (s) =>
          s.tenantId === tenantId &&
          s.customerId === customerId &&
          s.date >= fromDate &&
          s.date <= toDate,
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
