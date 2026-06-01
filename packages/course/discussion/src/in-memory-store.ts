import type { DiscussionStore, ListThreadFilter, Reply, Thread } from './types.js';

/** 記憶體版討論 store。 */
export class InMemoryDiscussionStore implements DiscussionStore {
  private readonly threads = new Map<string, Thread>();
  private readonly replies = new Map<string, Reply>();

  async getThread(id: string): Promise<Thread | undefined> {
    return this.threads.get(id);
  }
  async upsertThread(t: Thread): Promise<void> {
    this.threads.set(t.id, t);
  }
  async listThreads(filter: ListThreadFilter): Promise<Thread[]> {
    return Array.from(this.threads.values()).filter((t) => {
      if (t.tenantId !== filter.tenantId) return false;
      if (t.courseId !== filter.courseId) return false;
      if (filter.lessonId !== undefined && t.lessonId !== filter.lessonId) return false;
      if (filter.status && t.status !== filter.status) return false;
      if (filter.featuredOnly && t.status !== 'featured') return false;
      if (filter.tag && !t.tags.includes(filter.tag)) return false;
      return true;
    });
  }
  async getReply(id: string): Promise<Reply | undefined> {
    return this.replies.get(id);
  }
  async upsertReply(r: Reply): Promise<void> {
    this.replies.set(r.id, r);
  }
  async listReplies(threadId: string): Promise<Reply[]> {
    return Array.from(this.replies.values())
      .filter((r) => r.threadId === threadId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}
