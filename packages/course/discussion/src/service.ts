import { randomUUID } from 'node:crypto';

import type { DiscussionStore, Reply, Thread } from './types.js';

export interface CreateThreadInput {
  tenantId: string;
  courseId: string;
  lessonId?: string;
  authorId: string;
  title: string;
  body: string;
  timestampSeconds?: number;
  tags?: string[];
  now?: Date;
}

export interface ReplyInput {
  tenantId: string;
  threadId: string;
  authorId: string;
  body: string;
  parentReplyId?: string;
  /** 講師清單；若 authorId 在內，回覆標記為 isInstructorReply。 */
  instructorIds: string[];
  now?: Date;
}

/** 課程討論區 service。 */
export class DiscussionService {
  constructor(private readonly store: DiscussionStore) {}

  /** 建立新討論主題。 */
  async createThread(input: CreateThreadInput): Promise<Thread> {
    const now = input.now ?? new Date();
    const thread: Thread = {
      id: randomUUID(),
      tenantId: input.tenantId,
      courseId: input.courseId,
      lessonId: input.lessonId,
      authorId: input.authorId,
      title: input.title,
      body: input.body,
      timestampSeconds: input.timestampSeconds,
      tags: input.tags ?? [],
      status: 'open',
      upvotes: 0,
      replyCount: 0,
      instructorReplied: false,
      hasAcceptedAnswer: false,
      createdAt: now,
      updatedAt: now,
    };
    await this.store.upsertThread(thread);
    return thread;
  }

  /** 回覆主題（自動更新 thread.replyCount 與 instructorReplied）。 */
  async reply(input: ReplyInput): Promise<Reply> {
    const thread = await this.store.getThread(input.threadId);
    if (!thread) throw new Error(`找不到討論主題：${input.threadId}`);
    if (thread.status === 'closed' || thread.status === 'hidden') {
      throw new Error('此主題已關閉，無法回覆');
    }
    const now = input.now ?? new Date();
    const isInstructor = input.instructorIds.includes(input.authorId);
    const reply: Reply = {
      id: randomUUID(),
      tenantId: input.tenantId,
      threadId: input.threadId,
      parentReplyId: input.parentReplyId,
      authorId: input.authorId,
      body: input.body,
      isInstructorReply: isInstructor,
      isAcceptedAnswer: false,
      upvotes: 0,
      createdAt: now,
    };
    await this.store.upsertReply(reply);

    thread.replyCount += 1;
    if (isInstructor) thread.instructorReplied = true;
    thread.updatedAt = now;
    await this.store.upsertThread(thread);

    return reply;
  }

  /** 原作者採納某筆回覆為解答。 */
  async acceptAnswer(threadId: string, replyId: string, byUserId: string): Promise<void> {
    const thread = await this.store.getThread(threadId);
    if (!thread) throw new Error('找不到討論主題');
    if (thread.authorId !== byUserId) {
      throw new Error('只有原作者可採納解答');
    }
    const replies = await this.store.listReplies(threadId);
    const target = replies.find((r) => r.id === replyId);
    if (!target) throw new Error('找不到回覆');
    // 清掉舊的採納
    for (const r of replies) {
      if (r.isAcceptedAnswer && r.id !== replyId) {
        r.isAcceptedAnswer = false;
        await this.store.upsertReply(r);
      }
    }
    target.isAcceptedAnswer = true;
    await this.store.upsertReply(target);

    thread.hasAcceptedAnswer = true;
    thread.updatedAt = new Date();
    await this.store.upsertThread(thread);
  }

  /** 講師將主題標為精華。 */
  async featureThread(threadId: string): Promise<Thread> {
    const t = await this.store.getThread(threadId);
    if (!t) throw new Error('找不到討論主題');
    t.status = 'featured';
    t.updatedAt = new Date();
    await this.store.upsertThread(t);
    return t;
  }

  /** 講師關閉主題（不再接受回覆）。 */
  async closeThread(threadId: string): Promise<void> {
    const t = await this.store.getThread(threadId);
    if (!t) return;
    t.status = 'closed';
    t.updatedAt = new Date();
    await this.store.upsertThread(t);
  }

  /** 講師隱藏主題（違規內容）。 */
  async hideThread(threadId: string): Promise<void> {
    const t = await this.store.getThread(threadId);
    if (!t) return;
    t.status = 'hidden';
    t.updatedAt = new Date();
    await this.store.upsertThread(t);
  }

  async upvoteThread(threadId: string): Promise<void> {
    const t = await this.store.getThread(threadId);
    if (!t) return;
    t.upvotes += 1;
    await this.store.upsertThread(t);
  }

  async upvoteReply(replyId: string): Promise<void> {
    const r = await this.store.getReply(replyId);
    if (!r) return;
    r.upvotes += 1;
    await this.store.upsertReply(r);
  }

  /** 取得單元的提問列表（依時間戳排序，方便在進度條 marker 上顯示）。 */
  async listLessonQuestions(
    tenantId: string,
    courseId: string,
    lessonId: string,
  ): Promise<Thread[]> {
    const threads = await this.store.listThreads({ tenantId, courseId, lessonId });
    return threads
      .filter((t) => t.status !== 'hidden')
      .sort((a, b) => (a.timestampSeconds ?? 0) - (b.timestampSeconds ?? 0));
  }

  /** 精華區。 */
  async listFeatured(tenantId: string, courseId: string): Promise<Thread[]> {
    return this.store.listThreads({ tenantId, courseId, featuredOnly: true });
  }
}
