/** 課程內容型別與 store 介面定義。 */

/** 課程類型。 */
export type CourseType = 'video' | 'audio' | 'mixed' | 'live';

/** 課程狀態。 */
export type CourseStatus =
  | 'draft'
  | 'crowdfunding'
  | 'presale'
  | 'live'
  | 'archived';

/** 課程難度。 */
export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';

/** 課程銷售模式。 */
export type CoursePricingMode =
  | 'one-time'
  | 'subscription'
  | 'bundle'
  | 'pay-per-lesson';

/** 課程價格設定。 */
export interface CoursePricing {
  mode: CoursePricingMode;
  /** 標準售價（元）。 */
  price: number;
  /** 原價（劃線價）。 */
  comparePrice?: number;
  /** 早鳥價。 */
  earlyBirdPrice?: number;
  /** 早鳥截止時間。 */
  earlyBirdEndsAt?: Date;
  /** 募資目標金額。 */
  crowdfundingGoal?: number;
  /** 募資累計金額。 */
  crowdfundingCurrent?: number;
  /** 募資截止時間。 */
  crowdfundingDeadline?: Date;
}

/** 完課判定條件。 */
export interface CompletionCriteria {
  /** 觀看百分比閾值（0-100）。 */
  watchPercentage: number;
  /** 測驗通過率（0-100）。 */
  quizPassRate: number;
}

/** 課程主體。 */
export interface Course {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  /** 描述（HTML）。 */
  descriptionHtml?: string;
  shortDescription?: string;
  type: CourseType;
  status: CourseStatus;
  thumbnail?: string;
  coverImage?: string;
  previewVideo?: { videoId: string; duration: number };
  instructorIds: string[];
  categoryIds: string[];
  difficulty: CourseDifficulty;
  language: string;
  subtitleLanguages: string[];
  totalDuration: number;
  totalLessons: number;
  pricing: CoursePricing;
  outcomes: string[];
  suitableFor: string[];
  prerequisites: string[];
  faq: Array<{ q: string; a: string }>;
  completionCriteria: CompletionCriteria;
  certificateTemplateId?: string;
  enrollmentCount: number;
  rating: number;
  ratingCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** 課程章節。 */
export interface Chapter {
  id: string;
  tenantId: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  /** 整章免費試看。 */
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Lesson 類型。 */
export type LessonType =
  | 'video'
  | 'audio'
  | 'text'
  | 'pdf'
  | 'quiz'
  | 'assignment'
  | 'live';

/** Lesson 內容。 */
export interface LessonContent {
  videoId?: string;
  audioId?: string;
  html?: string;
  pdfUrl?: string;
  quizId?: string;
  assignmentId?: string;
  liveSessionId?: string;
}

/** 單元。 */
export interface Lesson {
  id: string;
  tenantId: string;
  courseId: string;
  chapterId: string;
  title: string;
  type: LessonType;
  content: LessonContent;
  /** 影片／音檔秒數。 */
  duration: number;
  order: number;
  isFree: boolean;
  /** 補充資料 URL。 */
  resources: string[];
  /** 字幕 SRT 內容。 */
  transcript?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Store 介面。 */
export interface CourseContentStore {
  upsertCourse(course: Course): Promise<Course>;
  findCourseById(id: string): Promise<Course | undefined>;
  findCourseBySlug(tenantId: string, slug: string): Promise<Course | undefined>;
  listCourses(tenantId: string, filter?: { status?: CourseStatus }): Promise<Course[]>;

  upsertChapter(chapter: Chapter): Promise<Chapter>;
  findChapterById(id: string): Promise<Chapter | undefined>;
  listChapters(courseId: string): Promise<Chapter[]>;

  upsertLesson(lesson: Lesson): Promise<Lesson>;
  findLessonById(id: string): Promise<Lesson | undefined>;
  listLessons(courseId: string): Promise<Lesson[]>;
}
