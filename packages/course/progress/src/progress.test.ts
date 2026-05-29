import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryProgressStore } from './in-memory-store.js';
import { MAX_SECONDS_DELTA, ProgressService } from './service.js';

const TENANT = 't1';

describe('ProgressService', () => {
  let store: InMemoryProgressStore;
  let svc: ProgressService;

  beforeEach(() => {
    store = new InMemoryProgressStore();
    svc = new ProgressService(store);
  });

  it('recordWatch 累加秒數 + 觸發完課', async () => {
    const now = new Date('2026-05-15T10:00:00Z');
    await svc.recordWatch({
      tenantId: TENANT,
      customerId: 'c1',
      courseId: 'cr1',
      lessonId: 'l1',
      secondsDelta: 400,
      currentPosition: 400,
      lessonDuration: 600,
      watchPercentage: 80,
      now,
    });
    let p = await store.findLessonProgress(TENANT, 'c1', 'cr1', 'l1');
    expect(p?.watchedSeconds).toBe(400);
    expect(p?.completedAt).toBeUndefined();
    await svc.recordWatch({
      tenantId: TENANT,
      customerId: 'c1',
      courseId: 'cr1',
      lessonId: 'l1',
      secondsDelta: 100,
      currentPosition: 500,
      lessonDuration: 600,
      watchPercentage: 80,
      now,
    });
    p = await store.findLessonProgress(TENANT, 'c1', 'cr1', 'l1');
    expect(p?.watchedSeconds).toBe(500);
    expect(p?.completedAt).toBeInstanceOf(Date);
  });

  it('跨裝置同步：device 不同，lastPosition 覆蓋', async () => {
    const now = new Date('2026-05-15T10:00:00Z');
    await svc.recordWatch({
      tenantId: TENANT,
      customerId: 'c1',
      courseId: 'cr1',
      lessonId: 'l1',
      secondsDelta: 100,
      currentPosition: 100,
      lessonDuration: 600,
      watchPercentage: 80,
      device: 'phone',
      now,
    });
    await svc.recordWatch({
      tenantId: TENANT,
      customerId: 'c1',
      courseId: 'cr1',
      lessonId: 'l1',
      secondsDelta: 50,
      currentPosition: 150,
      lessonDuration: 600,
      watchPercentage: 80,
      device: 'desktop',
      now,
    });
    const p = await store.findLessonProgress(TENANT, 'c1', 'cr1', 'l1');
    expect(p?.watchedSeconds).toBe(150);
    expect(p?.lastPosition).toBe(150);
    expect(p?.device).toBe('desktop');
  });

  it('secondsDelta 上限夾擊：超大值不會一口氣灌完課', async () => {
    const now = new Date('2026-05-15T10:00:00Z');
    // 偽造的 999999 秒（試圖一次刷滿完課條件）
    await svc.recordWatch({
      tenantId: TENANT,
      customerId: 'c1',
      courseId: 'cr1',
      lessonId: 'l1',
      secondsDelta: 999_999,
      currentPosition: 0,
      lessonDuration: 600,
      watchPercentage: 80,
      now,
    });
    const p = await store.findLessonProgress(TENANT, 'c1', 'cr1', 'l1');
    // 應該被夾到 MAX_SECONDS_DELTA，且不會跨過 lessonDuration
    expect(p?.watchedSeconds).toBeLessThanOrEqual(Math.max(MAX_SECONDS_DELTA, 600));
    expect(p?.watchedSeconds).toBeLessThanOrEqual(600);
  });

  it('watchedSeconds 不會超過 lessonDuration', async () => {
    const now = new Date('2026-05-15T10:00:00Z');
    // 兩次都用 cap 內的值，但相加遠超過 lessonDuration
    for (let i = 0; i < 3; i++) {
      await svc.recordWatch({
        tenantId: TENANT,
        customerId: 'c1',
        courseId: 'cr1',
        lessonId: 'l1',
        secondsDelta: MAX_SECONDS_DELTA,
        currentPosition: MAX_SECONDS_DELTA * (i + 1),
        lessonDuration: 600,
        watchPercentage: 80,
        now,
      });
    }
    const p = await store.findLessonProgress(TENANT, 'c1', 'cr1', 'l1');
    expect(p?.watchedSeconds).toBe(600);
  });

  it('secondsDelta 負值 → throw', async () => {
    await expect(
      svc.recordWatch({
        tenantId: TENANT,
        customerId: 'c1',
        courseId: 'cr1',
        lessonId: 'l1',
        secondsDelta: -1,
        currentPosition: 0,
        lessonDuration: 100,
        watchPercentage: 80,
      }),
    ).rejects.toThrow(/不可為負/);
  });

  it('getCourseProgress 計算百分比', async () => {
    const now = new Date('2026-05-15T10:00:00Z');
    await svc.recordWatch({
      tenantId: TENANT,
      customerId: 'c1',
      courseId: 'cr1',
      lessonId: 'l1',
      secondsDelta: 500,
      currentPosition: 500,
      lessonDuration: 600,
      watchPercentage: 80,
      now,
    });
    await svc.recordWatch({
      tenantId: TENANT,
      customerId: 'c1',
      courseId: 'cr1',
      lessonId: 'l2',
      secondsDelta: 100,
      currentPosition: 100,
      lessonDuration: 600,
      watchPercentage: 80,
      now,
    });
    const sum = await svc.getCourseProgress(TENANT, 'c1', 'cr1', {
      lessonDurations: { l1: 600, l2: 600, l3: 600 },
      watchPercentage: 80,
    });
    expect(sum.completedLessons).toBe(1);
    expect(sum.totalLessons).toBe(3);
    expect(sum.percentage).toBeCloseTo(33.33, 1);
    expect(sum.isCompleted).toBe(false);
  });

  it('全完課 isCompleted=true', async () => {
    const now = new Date('2026-05-15T10:00:00Z');
    await svc.recordWatch({
      tenantId: TENANT,
      customerId: 'c1',
      courseId: 'cr1',
      lessonId: 'l1',
      secondsDelta: 500,
      currentPosition: 500,
      lessonDuration: 600,
      watchPercentage: 80,
      now,
    });
    const sum = await svc.getCourseProgress(TENANT, 'c1', 'cr1', {
      lessonDurations: { l1: 600 },
      watchPercentage: 80,
    });
    expect(sum.isCompleted).toBe(true);
  });

  it('streak：連續 3 天有學習', async () => {
    const today = new Date('2026-05-15T10:00:00Z');
    const day1 = new Date('2026-05-13T10:00:00Z');
    const day2 = new Date('2026-05-14T10:00:00Z');
    for (const d of [day1, day2, today]) {
      await svc.recordWatch({
        tenantId: TENANT,
        customerId: 'c1',
        courseId: 'cr1',
        lessonId: 'l1',
        secondsDelta: 60,
        currentPosition: 60,
        lessonDuration: 600,
        watchPercentage: 80,
        now: d,
      });
    }
    const streak = await svc.getStreak(TENANT, 'c1', today);
    expect(streak).toBe(3);
  });

  it('streak：今天沒學 → 0', async () => {
    const yesterday = new Date('2026-05-14T10:00:00Z');
    await svc.recordWatch({
      tenantId: TENANT,
      customerId: 'c1',
      courseId: 'cr1',
      lessonId: 'l1',
      secondsDelta: 60,
      currentPosition: 60,
      lessonDuration: 600,
      watchPercentage: 80,
      now: yesterday,
    });
    const streak = await svc.getStreak(TENANT, 'c1', new Date('2026-05-15T10:00:00Z'));
    expect(streak).toBe(0);
  });

  it('getRangeTotal 聚合期間', async () => {
    const now = new Date('2026-05-15T10:00:00Z');
    await svc.recordWatch({
      tenantId: TENANT,
      customerId: 'c1',
      courseId: 'cr1',
      lessonId: 'l1',
      secondsDelta: 600,
      currentPosition: 600,
      lessonDuration: 600,
      watchPercentage: 80,
      now,
    });
    const r = await svc.getRangeTotal(TENANT, 'c1', '2026-05-01', '2026-05-31');
    expect(r.seconds).toBe(600);
    expect(r.lessonsCompleted).toBe(1);
    expect(r.days).toBe(1);
  });
});
