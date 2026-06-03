import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryCourseContentStore } from './in-memory-store.js';
import {
  isCrowdfundingClosed,
  isCrowdfundingFunded,
  isEarlyBirdActive,
  resolveEffectivePrice,
} from './pricing.js';
import { CourseContentService } from './service.js';

import type { Course } from './types.js';

const TENANT = 'tenant-1';

function baseCourse(over: Partial<Course> = {}): Course {
  return {
    id: 'crs-x',
    tenantId: TENANT,
    title: 'X',
    slug: 'x',
    type: 'video',
    status: 'live',
    instructorIds: [],
    categoryIds: [],
    difficulty: 'beginner',
    language: 'zh-TW',
    subtitleLanguages: [],
    totalDuration: 0,
    totalLessons: 0,
    pricing: { mode: 'one-time', price: 1000 },
    outcomes: [],
    suitableFor: [],
    prerequisites: [],
    faq: [],
    completionCriteria: { watchPercentage: 80, quizPassRate: 60 },
    enrollmentCount: 0,
    rating: 0,
    ratingCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  };
}

describe('pricing', () => {
  it('無早鳥 → 回 price', () => {
    expect(resolveEffectivePrice(baseCourse())).toBe(1000);
  });

  it('早鳥未過期 → 回早鳥價', () => {
    const future = new Date(Date.now() + 86400_000);
    const c = baseCourse({
      pricing: { mode: 'one-time', price: 1000, earlyBirdPrice: 700, earlyBirdEndsAt: future },
    });
    expect(resolveEffectivePrice(c)).toBe(700);
  });

  it('早鳥已過 → 回原價', () => {
    const past = new Date(Date.now() - 86400_000);
    const c = baseCourse({
      pricing: { mode: 'one-time', price: 1000, earlyBirdPrice: 700, earlyBirdEndsAt: past },
    });
    expect(resolveEffectivePrice(c)).toBe(1000);
  });

  it('isEarlyBirdActive 無 ends 視為一直生效', () => {
    expect(
      isEarlyBirdActive({ mode: 'one-time', price: 1000, earlyBirdPrice: 700 }),
    ).toBe(true);
  });

  it('crowdfunding 達標', () => {
    const c = baseCourse({
      pricing: { mode: 'one-time', price: 1000, crowdfundingGoal: 10000, crowdfundingCurrent: 12000 },
    });
    expect(isCrowdfundingFunded(c)).toBe(true);
    expect(isCrowdfundingClosed(c)).toBe(true);
  });

  it('crowdfunding 過期', () => {
    const past = new Date(Date.now() - 86400_000);
    const c = baseCourse({
      pricing: { mode: 'one-time', price: 1000, crowdfundingGoal: 10000, crowdfundingCurrent: 500, crowdfundingDeadline: past },
    });
    expect(isCrowdfundingFunded(c)).toBe(false);
    expect(isCrowdfundingClosed(c)).toBe(true);
  });
});

describe('CourseContentService', () => {
  let store: InMemoryCourseContentStore;
  let svc: CourseContentService;

  beforeEach(() => {
    store = new InMemoryCourseContentStore();
    svc = new CourseContentService(store);
  });

  it('建立課程 + 章節 + 單元 → totalLessons / totalDuration 自動累計', async () => {
    const course = await svc.upsertCourse({
      tenantId: TENANT,
      title: 'T',
      slug: 't',
      type: 'video',
      status: 'draft',
      pricing: { mode: 'one-time', price: 1000 },
    });
    const ch = await svc.upsertChapter({
      tenantId: TENANT,
      courseId: course.id,
      title: 'ch1',
      order: 1,
    });
    await svc.upsertLesson({
      tenantId: TENANT,
      courseId: course.id,
      chapterId: ch.id,
      title: 'l1',
      type: 'video',
      content: { videoId: 'v1' },
      duration: 600,
      order: 1,
    });
    await svc.upsertLesson({
      tenantId: TENANT,
      courseId: course.id,
      chapterId: ch.id,
      title: 'l2',
      type: 'video',
      content: { videoId: 'v2' },
      duration: 900,
      order: 2,
    });
    const updated = await store.findCourseById(course.id);
    expect(updated?.totalLessons).toBe(2);
    expect(updated?.totalDuration).toBe(1500);
  });

  it('isLessonFree：lesson.isFree=true', async () => {
    const course = await svc.upsertCourse({
      tenantId: TENANT,
      title: 'T',
      slug: 't',
      type: 'video',
      status: 'live',
      pricing: { mode: 'one-time', price: 0 },
    });
    const ch = await svc.upsertChapter({
      tenantId: TENANT,
      courseId: course.id,
      title: 'c',
      order: 1,
    });
    const lesson = await svc.upsertLesson({
      tenantId: TENANT,
      courseId: course.id,
      chapterId: ch.id,
      title: 'free',
      type: 'video',
      content: { videoId: 'v' },
      duration: 60,
      order: 1,
      isFree: true,
    });
    expect(await svc.isLessonFree(lesson.id)).toBe(true);
  });

  it('isLessonFree：整章免費', async () => {
    const course = await svc.upsertCourse({
      tenantId: TENANT,
      title: 'T',
      slug: 't',
      type: 'video',
      status: 'live',
      pricing: { mode: 'one-time', price: 0 },
    });
    const ch = await svc.upsertChapter({
      tenantId: TENANT,
      courseId: course.id,
      title: 'c',
      order: 1,
      isFree: true,
    });
    const lesson = await svc.upsertLesson({
      tenantId: TENANT,
      courseId: course.id,
      chapterId: ch.id,
      title: 'l',
      type: 'video',
      content: { videoId: 'v' },
      duration: 60,
      order: 1,
    });
    expect(await svc.isLessonFree(lesson.id)).toBe(true);
  });

  it('getCurriculum 回章節 + 單元', async () => {
    const course = await svc.upsertCourse({
      tenantId: TENANT,
      title: 'T',
      slug: 't',
      type: 'video',
      status: 'live',
      pricing: { mode: 'one-time', price: 0 },
    });
    const ch1 = await svc.upsertChapter({
      tenantId: TENANT,
      courseId: course.id,
      title: 'A',
      order: 1,
    });
    const ch2 = await svc.upsertChapter({
      tenantId: TENANT,
      courseId: course.id,
      title: 'B',
      order: 2,
    });
    await svc.upsertLesson({
      tenantId: TENANT,
      courseId: course.id,
      chapterId: ch1.id,
      title: 'l1',
      type: 'video',
      content: {},
      duration: 1,
      order: 1,
    });
    await svc.upsertLesson({
      tenantId: TENANT,
      courseId: course.id,
      chapterId: ch2.id,
      title: 'l2',
      type: 'video',
      content: {},
      duration: 2,
      order: 1,
    });
    const cur = await svc.getCurriculum(course.id);
    expect(cur).toHaveLength(2);
    expect(cur[0]?.chapter.id).toBe(ch1.id);
    expect(cur[0]?.lessons).toHaveLength(1);
    expect(cur[1]?.lessons[0]?.title).toBe('l2');
  });

  it('募資推進 + 達標自動轉 live', async () => {
    const course = await svc.upsertCourse({
      tenantId: TENANT,
      title: 'T',
      slug: 't',
      type: 'video',
      status: 'crowdfunding',
      pricing: { mode: 'one-time', price: 1000, crowdfundingGoal: 3000, crowdfundingCurrent: 0 },
    });
    await svc.addCrowdfundingContribution(course.id, 1500);
    let promoted = await svc.promoteCrowdfundingIfFunded(course.id);
    expect(promoted).toBeUndefined();
    await svc.addCrowdfundingContribution(course.id, 2000);
    promoted = await svc.promoteCrowdfundingIfFunded(course.id);
    expect(promoted?.status).toBe('live');
    expect(promoted?.pricing.crowdfundingCurrent).toBe(3500);
  });

  it('非募資課程不能加金額', async () => {
    const course = await svc.upsertCourse({
      tenantId: TENANT,
      title: 'T',
      slug: 't',
      type: 'video',
      status: 'live',
      pricing: { mode: 'one-time', price: 0 },
    });
    await expect(svc.addCrowdfundingContribution(course.id, 100)).rejects.toThrow(/非募資/);
  });

  it('getEffectivePrice 取早鳥', async () => {
    const future = new Date(Date.now() + 86400_000);
    const course = await svc.upsertCourse({
      tenantId: TENANT,
      title: 'T',
      slug: 't',
      type: 'video',
      status: 'live',
      pricing: {
        mode: 'one-time',
        price: 1000,
        earlyBirdPrice: 600,
        earlyBirdEndsAt: future,
      },
    });
    expect(await svc.getEffectivePrice(course.id)).toBe(600);
  });
});
