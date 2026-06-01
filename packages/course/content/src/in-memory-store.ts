import type {
  Chapter,
  Course,
  CourseContentStore,
  CourseStatus,
  Lesson,
} from './types.js';

/** 記憶體實作的 store（測試與原型用）。 */
export class InMemoryCourseContentStore implements CourseContentStore {
  private readonly courses = new Map<string, Course>();
  private readonly chapters = new Map<string, Chapter>();
  private readonly lessons = new Map<string, Lesson>();

  async upsertCourse(course: Course): Promise<Course> {
    this.courses.set(course.id, course);
    return course;
  }

  async findCourseById(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async findCourseBySlug(tenantId: string, slug: string): Promise<Course | undefined> {
    for (const c of this.courses.values()) {
      if (c.tenantId === tenantId && c.slug === slug) return c;
    }
    return undefined;
  }

  async listCourses(
    tenantId: string,
    filter?: { status?: CourseStatus },
  ): Promise<Course[]> {
    return [...this.courses.values()].filter((c) => {
      if (c.tenantId !== tenantId) return false;
      if (filter?.status && c.status !== filter.status) return false;
      return true;
    });
  }

  async upsertChapter(chapter: Chapter): Promise<Chapter> {
    this.chapters.set(chapter.id, chapter);
    return chapter;
  }

  async findChapterById(id: string): Promise<Chapter | undefined> {
    return this.chapters.get(id);
  }

  async listChapters(courseId: string): Promise<Chapter[]> {
    return [...this.chapters.values()]
      .filter((c) => c.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }

  async upsertLesson(lesson: Lesson): Promise<Lesson> {
    this.lessons.set(lesson.id, lesson);
    return lesson;
  }

  async findLessonById(id: string): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async listLessons(courseId: string): Promise<Lesson[]> {
    return [...this.lessons.values()]
      .filter((l) => l.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }
}
