/** 單元學習進度紀錄。 */
export interface LessonProgress {
  id: string;
  tenantId: string;
  customerId: string;
  courseId: string;
  lessonId: string;
  /** 已看秒數（累計，不論重看）。 */
  watchedSeconds: number;
  /** 最近播放位置（秒）。 */
  lastPosition: number;
  /** 完成時間（達 watchPercentage 時設值）。 */
  completedAt?: Date;
  device?: string;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** 每日學習紀錄（用於 streak / 週月報）。 */
export interface DailyLearningStat {
  id: string;
  tenantId: string;
  customerId: string;
  /** 日期 YYYY-MM-DD（UTC）。 */
  date: string;
  /** 當日總學習秒數。 */
  seconds: number;
  /** 當日完成單元數。 */
  lessonsCompleted: number;
}

export interface ProgressStore {
  upsertLessonProgress(p: LessonProgress): Promise<LessonProgress>;
  findLessonProgress(
    tenantId: string,
    customerId: string,
    courseId: string,
    lessonId: string,
  ): Promise<LessonProgress | undefined>;
  listCourseProgress(
    tenantId: string,
    customerId: string,
    courseId: string,
  ): Promise<LessonProgress[]>;
  upsertDailyStat(s: DailyLearningStat): Promise<DailyLearningStat>;
  findDailyStat(
    tenantId: string,
    customerId: string,
    date: string,
  ): Promise<DailyLearningStat | undefined>;
  listDailyStats(
    tenantId: string,
    customerId: string,
    fromDate: string,
    toDate: string,
  ): Promise<DailyLearningStat[]>;
}

/** 完課判定輸入。 */
export interface CompletionInput {
  /** 單元總秒數對應表（lessonId → duration）。 */
  lessonDurations: Record<string, number>;
  /** 完課閾值（0-100）。 */
  watchPercentage: number;
}

/** 課程整體進度結果。 */
export interface CourseProgressSummary {
  /** 已完成單元數。 */
  completedLessons: number;
  /** 總單元數。 */
  totalLessons: number;
  /** 進度百分比（0-100）。 */
  percentage: number;
  /** 是否達完課閾值。 */
  isCompleted: boolean;
}
