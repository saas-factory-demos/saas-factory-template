import { describe, expect, it } from 'vitest';

import { InMemoryNoteStore } from './in-memory-store.js';
import { formatTimestamp, NotesService } from './service.js';

const TENANT = 't1';
const USER = 'u1';
const COURSE = 'c1';
const LESSON = 'l1';

function setup() {
  const store = new InMemoryNoteStore();
  return { store, svc: new NotesService(store) };
}

describe('formatTimestamp', () => {
  it('< 1 小時 → MM:SS', () => {
    expect(formatTimestamp(75)).toBe('01:15');
  });
  it('>= 1 小時 → H:MM:SS', () => {
    expect(formatTimestamp(3725)).toBe('1:02:05');
  });
});

describe('NotesService CRUD', () => {
  it('create + listByLesson 排序', async () => {
    const { svc } = setup();
    await svc.create({
      tenantId: TENANT,
      userId: USER,
      courseId: COURSE,
      lessonId: LESSON,
      timestampSeconds: 200,
      content: 'B',
    });
    await svc.create({
      tenantId: TENANT,
      userId: USER,
      courseId: COURSE,
      lessonId: LESSON,
      timestampSeconds: 50,
      content: 'A',
    });
    const list = await svc.listByLesson(TENANT, USER, COURSE, LESSON);
    expect(list.map((n) => n.content)).toEqual(['A', 'B']);
  });

  it('update 不改 createdAt', async () => {
    const { svc } = setup();
    const n = await svc.create({
      tenantId: TENANT,
      userId: USER,
      courseId: COURSE,
      lessonId: LESSON,
      timestampSeconds: 10,
      content: 'old',
      now: new Date(2026, 4, 15, 10, 0, 0),
    });
    const up = await svc.update({
      id: n.id,
      content: 'new',
      now: new Date(2026, 4, 15, 11, 0, 0),
    });
    expect(up.content).toBe('new');
    expect(up.createdAt.getTime()).toBe(n.createdAt.getTime());
    expect(up.updatedAt.getTime()).toBeGreaterThan(n.updatedAt.getTime());
  });

  it('remove 是軟刪（tombstone），list 不會回傳', async () => {
    const { svc, store } = setup();
    const n = await svc.create({
      tenantId: TENANT,
      userId: USER,
      courseId: COURSE,
      lessonId: LESSON,
      timestampSeconds: 10,
      content: 'x',
    });
    await svc.remove(n.id);
    expect((await store.get(n.id))?.deleted).toBe(true);
    expect(await svc.listByLesson(TENANT, USER, COURSE, LESSON)).toHaveLength(0);
  });
});

describe('NotesService.sync', () => {
  it('client 較新 → 寫入；client 較舊 → 不覆蓋', async () => {
    const { svc, store } = setup();
    const created = await svc.create({
      tenantId: TENANT,
      userId: USER,
      courseId: COURSE,
      lessonId: LESSON,
      timestampSeconds: 10,
      content: 'server',
      now: new Date(2026, 4, 15, 10, 0, 0),
    });
    // 較新的版本
    const newerIncoming = {
      ...created,
      content: 'client-newer',
      updatedAt: new Date(2026, 4, 15, 11, 0, 0),
    };
    await svc.sync({
      tenantId: TENANT,
      userId: USER,
      since: new Date(2026, 4, 14),
      incoming: [newerIncoming],
    });
    expect((await store.get(created.id))?.content).toBe('client-newer');

    // 較舊的版本不應覆蓋
    const olderIncoming = { ...newerIncoming, content: 'client-older', updatedAt: new Date(2026, 4, 15, 9, 0, 0) };
    await svc.sync({
      tenantId: TENANT,
      userId: USER,
      since: new Date(2026, 4, 14),
      incoming: [olderIncoming],
    });
    expect((await store.get(created.id))?.content).toBe('client-newer');
  });

  it('回傳自 since 後變動的筆記', async () => {
    const { svc } = setup();
    const since = new Date(2026, 4, 15, 10, 0, 0);
    await svc.create({
      tenantId: TENANT,
      userId: USER,
      courseId: COURSE,
      lessonId: LESSON,
      timestampSeconds: 1,
      content: 'old',
      now: new Date(2026, 4, 15, 9, 0, 0),
    });
    const fresh = await svc.create({
      tenantId: TENANT,
      userId: USER,
      courseId: COURSE,
      lessonId: LESSON,
      timestampSeconds: 2,
      content: 'fresh',
      now: new Date(2026, 4, 15, 11, 0, 0),
    });
    const r = await svc.sync({ tenantId: TENANT, userId: USER, since, incoming: [] });
    expect(r.updated.map((n) => n.id)).toContain(fresh.id);
    expect(r.updated.map((n) => n.id)).not.toContain('old');
  });
});

describe('NotesService.exportMarkdown', () => {
  it('輸出 markdown，依時間戳排序，含課程 / 單元標題', async () => {
    const { svc } = setup();
    await svc.create({
      tenantId: TENANT,
      userId: USER,
      courseId: COURSE,
      lessonId: 'l1',
      timestampSeconds: 65,
      content: '第一個觀念',
    });
    await svc.create({
      tenantId: TENANT,
      userId: USER,
      courseId: COURSE,
      lessonId: 'l1',
      timestampSeconds: 10,
      content: '開場',
    });
    const md = await svc.exportMarkdown({
      tenantId: TENANT,
      userId: USER,
      courseId: COURSE,
      courseTitle: 'TS 進階',
      lessonTitles: new Map([['l1', '泛型']]),
    });
    expect(md).toContain('# TS 進階 筆記');
    expect(md).toContain('## 泛型');
    expect(md.indexOf('開場')).toBeLessThan(md.indexOf('第一個觀念'));
    expect(md).toContain('**01:05** — 第一個觀念');
  });
});
