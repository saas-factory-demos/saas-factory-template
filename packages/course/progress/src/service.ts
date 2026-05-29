import type {
  CompletionInput,
  CourseProgressSummary,
  DailyLearningStat,
  LessonProgress,
  ProgressStore,
} from './types.js';

/** UTC 日期字串 YYYY-MM-DD。 */
function utcDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * 單次 `recordWatch` 可接受的最大秒數增量（防止 client 偽造完課）。
 * 客戶端典型回報間隔為 10-30 秒，設 600 秒（10 分鐘）已含緩衝。
 */
export const MAX_SECONDS_DELTA = 600;

/** 學習進度服務（跨裝置同步 + 完課判定 + streak）。 */
export class ProgressService {
  private readonly store: ProgressStore;

  constructor(store: ProgressStore) {
    this.store = store;
  }

  private genId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * 上報觀看進度（每 N 秒由 client 呼叫一次）。
   *
   * @param secondsDelta 自上次上報以來累加的秒數（不是當前位置）。
   * @param lessonDuration 單元總秒數（用於完課判定）。
   * @param watchPercentage 完課閾值（0-100）。
   */
  async recordWatch(input: {
    tenantId: string;
    customerId: string;
    courseId: string;
    lessonId: string;
    secondsDelta: number;
    currentPosition: number;
    lessonDuration: number;
    watchPercentage: number;
    device?: string;
    now?: Date;
  }): Promise<LessonProgress> {
    if (input.secondsDelta < 0) throw new Error('secondsDelta 不可為負');
    // 上限夾擊：避免 client 端傳 `secondsDelta: 999999` 一次刷滿完課條件，
    // 進而觸發證書發放／拒退費等金流／權益後果。
    const clampedDelta = Math.min(input.secondsDelta, MAX_SECONDS_DELTA);
    const now = input.now ?? new Date();
    const existing = await this.store.findLessonProgress(
      input.tenantId,
      input.customerId,
      input.courseId,
      input.lessonId,
    );
    // 累計觀看秒數同樣夾到 lessonDuration，避免單一學員無限累積、扭曲報表。
    const rawWatched = (existing?.watchedSeconds ?? 0) + clampedDelta;
    const watchedSeconds =
      input.lessonDuration > 0 ? Math.min(rawWatched, input.lessonDuration) : rawWatched;
    const completed =
      existing?.completedAt ??
      (input.lessonDuration > 0 &&
      watchedSeconds / input.lessonDuration >= input.watchPercentage / 100
        ? now
        : undefined);

    const lp: LessonProgress = {
      id: existing?.id ?? this.genId('lpr'),
      tenantId: input.tenantId,
      customerId: input.customerId,
      courseId: input.courseId,
      lessonId: input.lessonId,
      watchedSeconds,
      lastPosition: input.currentPosition,
      completedAt: completed,
      device: input.device ?? existing?.device,
      lastAccessedAt: now,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await this.store.upsertLessonProgress(lp);
    await this.upsertDailyStat({
      tenantId: input.tenantId,
      customerId: input.customerId,
      date: utcDateString(now),
      secondsDelta: clampedDelta,
      lessonCompleted: completed && !existing?.completedAt ? 1 : 0,
    });
    return lp;
  }

  /** 計算課程整體進度。 */
  async getCourseProgress(
    tenantId: string,
    customerId: string,
    courseId: string,
    completion: CompletionInput,
  ): Promise<CourseProgressSummary> {
    const list = await this.store.listCourseProgress(tenantId, customerId, courseId);
    const lessonIds = Object.keys(completion.lessonDurations);
    const totalLessons = lessonIds.length;
    let completedLessons = 0;
    for (const lid of lessonIds) {
      const p = list.find((x) => x.lessonId === lid);
      if (!p) continue;
      const dur = completion.lessonDurations[lid] ?? 0;
      if (dur <= 0) continue;
      if (p.watchedSeconds / dur >= completion.watchPercentage / 100) {
        completedLessons += 1;
      }
    }
    const percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    return {
      completedLessons,
      totalLessons,
      percentage: Math.round(percentage * 100) / 100,
      isCompleted: totalLessons > 0 && completedLessons === totalLessons,
    };
  }

  /** 把秒數加進每日統計（lessonCompleted 為「本次新完成」的增量）。 */
  private async upsertDailyStat(input: {
    tenantId: string;
    customerId: string;
    date: string;
    secondsDelta: number;
    lessonCompleted: number;
  }): Promise<DailyLearningStat> {
    const existing = await this.store.findDailyStat(
      input.tenantId,
      input.customerId,
      input.date,
    );
    const s: DailyLearningStat = existing
      ? {
          ...existing,
          seconds: existing.seconds + input.secondsDelta,
          lessonsCompleted: existing.lessonsCompleted + input.lessonCompleted,
        }
      : {
          id: this.genId('dls'),
          tenantId: input.tenantId,
          customerId: input.customerId,
          date: input.date,
          seconds: input.secondsDelta,
          lessonsCompleted: input.lessonCompleted,
        };
    return this.store.upsertDailyStat(s);
  }

  /** 取最近 N 天連續學習天數。 */
  async getStreak(tenantId: string, customerId: string, now: Date = new Date()): Promise<number> {
    let streak = 0;
    for (let i = 0; i < 365; i += 1) {
      const d = new Date(now.getTime() - i * 86400_000);
      const ds = await this.store.findDailyStat(tenantId, customerId, utcDateString(d));
      if (ds && ds.seconds > 0) {
        streak += 1;
      } else if (i === 0) {
        // 今天還沒學也算斷掉，但允許昨天為起點？這裡走嚴格：今天斷=0。
        return 0;
      } else {
        return streak;
      }
    }
    return streak;
  }

  /** 取本週 / 任意期間總學習秒數。 */
  async getRangeTotal(
    tenantId: string,
    customerId: string,
    fromDate: string,
    toDate: string,
  ): Promise<{ seconds: number; lessonsCompleted: number; days: number }> {
    const list = await this.store.listDailyStats(tenantId, customerId, fromDate, toDate);
    return {
      seconds: list.reduce((s, x) => s + x.seconds, 0),
      lessonsCompleted: list.reduce((s, x) => s + x.lessonsCompleted, 0),
      days: list.length,
    };
  }
}
