import { describe, expect, it } from 'vitest';

import { InMemoryDiscussionStore } from './in-memory-store.js';
import { DiscussionService } from './service.js';

const TENANT = 't1';
const COURSE = 'c1';
const LESSON = 'l1';
const INSTRUCTOR = 'teacher-1';

function setup() {
  const store = new InMemoryDiscussionStore();
  return { store, svc: new DiscussionService(store) };
}

describe('DiscussionService.createThread', () => {
  it('帶時間戳建立提問', async () => {
    const { svc } = setup();
    const t = await svc.createThread({
      tenantId: TENANT,
      courseId: COURSE,
      lessonId: LESSON,
      authorId: 'u1',
      title: '14:25 的範例不懂',
      body: '為何要這樣寫？',
      timestampSeconds: 865,
      tags: ['typescript'],
    });
    expect(t.status).toBe('open');
    expect(t.timestampSeconds).toBe(865);
    expect(t.tags).toEqual(['typescript']);
  });
});

describe('DiscussionService.reply', () => {
  it('講師回覆 → instructorReplied = true', async () => {
    const { svc, store } = setup();
    const t = await svc.createThread({
      tenantId: TENANT,
      courseId: COURSE,
      authorId: 'u1',
      title: 'Q',
      body: '?',
    });
    await svc.reply({
      tenantId: TENANT,
      threadId: t.id,
      authorId: INSTRUCTOR,
      body: '解答如下',
      instructorIds: [INSTRUCTOR],
    });
    const updated = await store.getThread(t.id);
    expect(updated?.instructorReplied).toBe(true);
    expect(updated?.replyCount).toBe(1);
  });

  it('同學互助回覆 → 非講師', async () => {
    const { svc } = setup();
    const t = await svc.createThread({
      tenantId: TENANT,
      courseId: COURSE,
      authorId: 'u1',
      title: 'Q',
      body: '?',
    });
    const r = await svc.reply({
      tenantId: TENANT,
      threadId: t.id,
      authorId: 'u2',
      body: '我也遇過',
      instructorIds: [INSTRUCTOR],
    });
    expect(r.isInstructorReply).toBe(false);
  });

  it('已關閉主題 → throw', async () => {
    const { svc } = setup();
    const t = await svc.createThread({
      tenantId: TENANT,
      courseId: COURSE,
      authorId: 'u1',
      title: 'Q',
      body: '?',
    });
    await svc.closeThread(t.id);
    await expect(
      svc.reply({
        tenantId: TENANT,
        threadId: t.id,
        authorId: 'u2',
        body: 'x',
        instructorIds: [],
      }),
    ).rejects.toThrow(/關閉/);
  });

  it('回覆樹：parentReplyId 互助', async () => {
    const { svc } = setup();
    const t = await svc.createThread({
      tenantId: TENANT,
      courseId: COURSE,
      authorId: 'u1',
      title: 'Q',
      body: '?',
    });
    const r1 = await svc.reply({
      tenantId: TENANT,
      threadId: t.id,
      authorId: 'u2',
      body: '我猜是 X',
      instructorIds: [],
    });
    const r2 = await svc.reply({
      tenantId: TENANT,
      threadId: t.id,
      authorId: 'u3',
      body: '應該是 Y 比較對',
      parentReplyId: r1.id,
      instructorIds: [],
    });
    expect(r2.parentReplyId).toBe(r1.id);
  });
});

describe('DiscussionService.acceptAnswer', () => {
  it('原作者採納回覆 → hasAcceptedAnswer = true', async () => {
    const { svc, store } = setup();
    const t = await svc.createThread({
      tenantId: TENANT,
      courseId: COURSE,
      authorId: 'u1',
      title: 'Q',
      body: '?',
    });
    const r = await svc.reply({
      tenantId: TENANT,
      threadId: t.id,
      authorId: INSTRUCTOR,
      body: 'A',
      instructorIds: [INSTRUCTOR],
    });
    await svc.acceptAnswer(t.id, r.id, 'u1');
    expect((await store.getThread(t.id))?.hasAcceptedAnswer).toBe(true);
    expect((await store.getReply(r.id))?.isAcceptedAnswer).toBe(true);
  });

  it('非原作者採納 → throw', async () => {
    const { svc } = setup();
    const t = await svc.createThread({
      tenantId: TENANT,
      courseId: COURSE,
      authorId: 'u1',
      title: 'Q',
      body: '?',
    });
    const r = await svc.reply({
      tenantId: TENANT,
      threadId: t.id,
      authorId: 'u2',
      body: 'A',
      instructorIds: [],
    });
    await expect(svc.acceptAnswer(t.id, r.id, 'u9')).rejects.toThrow(/原作者/);
  });

  it('採納新解答 → 舊解答取消標記', async () => {
    const { svc, store } = setup();
    const t = await svc.createThread({
      tenantId: TENANT,
      courseId: COURSE,
      authorId: 'u1',
      title: 'Q',
      body: '?',
    });
    const r1 = await svc.reply({
      tenantId: TENANT,
      threadId: t.id,
      authorId: 'u2',
      body: 'A1',
      instructorIds: [],
    });
    const r2 = await svc.reply({
      tenantId: TENANT,
      threadId: t.id,
      authorId: 'u3',
      body: 'A2',
      instructorIds: [],
    });
    await svc.acceptAnswer(t.id, r1.id, 'u1');
    await svc.acceptAnswer(t.id, r2.id, 'u1');
    expect((await store.getReply(r1.id))?.isAcceptedAnswer).toBe(false);
    expect((await store.getReply(r2.id))?.isAcceptedAnswer).toBe(true);
  });
});

describe('DiscussionService.listLessonQuestions', () => {
  it('依時間戳排序，忽略 hidden', async () => {
    const { svc } = setup();
    const a = await svc.createThread({
      tenantId: TENANT,
      courseId: COURSE,
      lessonId: LESSON,
      authorId: 'u1',
      title: 'A',
      body: '',
      timestampSeconds: 200,
    });
    await svc.createThread({
      tenantId: TENANT,
      courseId: COURSE,
      lessonId: LESSON,
      authorId: 'u2',
      title: 'B',
      body: '',
      timestampSeconds: 50,
    });
    const c = await svc.createThread({
      tenantId: TENANT,
      courseId: COURSE,
      lessonId: LESSON,
      authorId: 'u3',
      title: 'C',
      body: '',
      timestampSeconds: 100,
    });
    await svc.hideThread(a.id);
    const list = await svc.listLessonQuestions(TENANT, COURSE, LESSON);
    expect(list.map((t) => t.title)).toEqual(['B', 'C']);
    expect(list).not.toContainEqual(expect.objectContaining({ id: a.id }));
    expect(c).toBeDefined();
  });
});

describe('DiscussionService.feature', () => {
  it('精華區只回傳 featured', async () => {
    const { svc } = setup();
    const a = await svc.createThread({
      tenantId: TENANT,
      courseId: COURSE,
      authorId: 'u1',
      title: 'A',
      body: '',
    });
    await svc.createThread({
      tenantId: TENANT,
      courseId: COURSE,
      authorId: 'u2',
      title: 'B',
      body: '',
    });
    await svc.featureThread(a.id);
    const list = await svc.listFeatured(TENANT, COURSE);
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe(a.id);
  });
});
