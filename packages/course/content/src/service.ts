import { isCrowdfundingFunded, resolveEffectivePrice } from './pricing.js';

import type {
  Chapter,
  Course,
  CourseContentStore,
  CoursePricing,
  CourseStatus,
  CourseType,
  CourseDifficulty,
  CompletionCriteria,
  Lesson,
  LessonContent,
  LessonType,
} from './types.js';

/** 課程內容服務（CRUD + 自動計算 totalDuration / totalLessons + 募資判定）。 */
export class CourseContentService {
  private readonly store: CourseContentStore;

  constructor(store: CourseContentStore) {
    this.store = store;
  }

  private genId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /** 建立／更新課程。 */
  async upsertCourse(input: {
    id?: string;
    tenantId: string;
    title: string;
    slug: string;
    descriptionHtml?: string;
    shortDescription?: string;
    type: CourseType;
    status: CourseStatus;
    thumbnail?: string;
    coverImage?: string;
    previewVideo?: { videoId: string; duration: number };
    instructorIds?: string[];
    categoryIds?: string[];
    difficulty?: CourseDifficulty;
    language?: string;
    subtitleLanguages?: string[];
    pricing: CoursePricing;
    outcomes?: string[];
    suitableFor?: string[];
    prerequisites?: string[];
    faq?: Array<{ q: string; a: string }>;
    completionCriteria?: CompletionCriteria;
    certificateTemplateId?: string;
  }): Promise<Course> {
    const now = new Date();
    const existing = input.id ? await this.store.findCourseById(input.id) : undefined;
    if (existing && existing.tenantId !== input.tenantId) {
      throw new Error('tenantId 不可變更');
    }
    const course: Course = {
      id: existing?.id ?? this.genId('crs'),
      tenantId: input.tenantId,
      title: input.title,
      slug: input.slug,
      descriptionHtml: input.descriptionHtml,
      shortDescription: input.shortDescription,
      type: input.type,
      status: input.status,
      thumbnail: input.thumbnail,
      coverImage: input.coverImage,
      previewVideo: input.previewVideo,
      instructorIds: input.instructorIds ?? [],
      categoryIds: input.categoryIds ?? [],
      difficulty: input.difficulty ?? 'beginner',
      language: input.language ?? 'zh-TW',
      subtitleLanguages: input.subtitleLanguages ?? [],
      totalDuration: existing?.totalDuration ?? 0,
      totalLessons: existing?.totalLessons ?? 0,
      pricing: input.pricing,
      outcomes: input.outcomes ?? [],
      suitableFor: input.suitableFor ?? [],
      prerequisites: input.prerequisites ?? [],
      faq: input.faq ?? [],
      completionCriteria: input.completionCriteria ?? {
        watchPercentage: 80,
        quizPassRate: 60,
      },
      certificateTemplateId: input.certificateTemplateId,
      enrollmentCount: existing?.enrollmentCount ?? 0,
      rating: existing?.rating ?? 0,
      ratingCount: existing?.ratingCount ?? 0,
      publishedAt:
        existing?.publishedAt ?? (input.status === 'live' ? now : undefined),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    return this.store.upsertCourse(course);
  }

  /** 建立／更新章節。 */
  async upsertChapter(input: {
    id?: string;
    tenantId: string;
    courseId: string;
    title: string;
    description?: string;
    order: number;
    isFree?: boolean;
  }): Promise<Chapter> {
    const now = new Date();
    const existing = input.id ? await this.store.findChapterById(input.id) : undefined;
    const ch: Chapter = {
      id: existing?.id ?? this.genId('chp'),
      tenantId: input.tenantId,
      courseId: input.courseId,
      title: input.title,
      description: input.description,
      order: input.order,
      isFree: input.isFree ?? false,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    return this.store.upsertChapter(ch);
  }

  /** 建立／更新單元，並重算課程 totalDuration / totalLessons。 */
  async upsertLesson(input: {
    id?: string;
    tenantId: string;
    courseId: string;
    chapterId: string;
    title: string;
    type: LessonType;
    content: LessonContent;
    duration: number;
    order: number;
    isFree?: boolean;
    resources?: string[];
    transcript?: string;
  }): Promise<Lesson> {
    const now = new Date();
    const existing = input.id ? await this.store.findLessonById(input.id) : undefined;
    const lesson: Lesson = {
      id: existing?.id ?? this.genId('lsn'),
      tenantId: input.tenantId,
      courseId: input.courseId,
      chapterId: input.chapterId,
      title: input.title,
      type: input.type,
      content: input.content,
      duration: input.duration,
      order: input.order,
      isFree: input.isFree ?? false,
      resources: input.resources ?? [],
      transcript: input.transcript,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await this.store.upsertLesson(lesson);
    await this.recalcCourseTotals(input.courseId);
    return lesson;
  }

  /** 重算課程總時數 / 總單元數。 */
  async recalcCourseTotals(courseId: string): Promise<void> {
    const course = await this.store.findCourseById(courseId);
    if (!course) return;
    const lessons = await this.store.listLessons(courseId);
    const totalDuration = lessons.reduce((s, l) => s + l.duration, 0);
    course.totalLessons = lessons.length;
    course.totalDuration = totalDuration;
    course.updatedAt = new Date();
    await this.store.upsertCourse(course);
  }

  /** 取出課程目錄（章節 + 章內單元）。 */
  async getCurriculum(courseId: string): Promise<
    Array<{ chapter: Chapter; lessons: Lesson[] }>
  > {
    const chapters = await this.store.listChapters(courseId);
    const allLessons = await this.store.listLessons(courseId);
    return chapters.map((chapter) => ({
      chapter,
      lessons: allLessons.filter((l) => l.chapterId === chapter.id),
    }));
  }

  /** 判斷單元是否可免費試看（lesson.isFree 或 chapter.isFree）。 */
  async isLessonFree(lessonId: string): Promise<boolean> {
    const lesson = await this.store.findLessonById(lessonId);
    if (!lesson) return false;
    if (lesson.isFree) return true;
    const chapter = await this.store.findChapterById(lesson.chapterId);
    return chapter?.isFree ?? false;
  }

  /** 取得當前售價。 */
  async getEffectivePrice(courseId: string, now: Date = new Date()): Promise<number> {
    const course = await this.store.findCourseById(courseId);
    if (!course) throw new Error(`課程不存在：${courseId}`);
    return resolveEffectivePrice(course, now);
  }

  /** 推進募資金額（成功才寫入；達標仍允許繼續累計）。 */
  async addCrowdfundingContribution(courseId: string, amount: number): Promise<Course> {
    const course = await this.store.findCourseById(courseId);
    if (!course) throw new Error(`課程不存在：${courseId}`);
    if (course.status !== 'crowdfunding') {
      throw new Error(`課程非募資中：status=${course.status}`);
    }
    const cur = course.pricing.crowdfundingCurrent ?? 0;
    course.pricing.crowdfundingCurrent = cur + amount;
    course.updatedAt = new Date();
    return this.store.upsertCourse(course);
  }

  /** 募資達標 → 自動轉成 live。 */
  async promoteCrowdfundingIfFunded(courseId: string): Promise<Course | undefined> {
    const course = await this.store.findCourseById(courseId);
    if (!course || course.status !== 'crowdfunding') return undefined;
    if (!isCrowdfundingFunded(course)) return undefined;
    course.status = 'live';
    course.publishedAt = course.publishedAt ?? new Date();
    course.updatedAt = new Date();
    return this.store.upsertCourse(course);
  }
}
