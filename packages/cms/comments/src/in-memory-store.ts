import type { Comment, CommentFilter, CommentStore } from './types.js';

/**
 * 記憶體版留言儲存（測試 + 開發用）。
 */
export class InMemoryCommentStore implements CommentStore {
  private readonly items = new Map<string, Comment>();

  async create(comment: Comment): Promise<Comment> {
    this.items.set(comment.id, comment);
    return comment;
  }

  async update(id: string, patch: Partial<Comment>): Promise<Comment> {
    const cur = this.items.get(id);
    if (!cur) throw new Error(`Comment 不存在：${id}`);
    const next: Comment = { ...cur, ...patch, updatedAt: new Date() };
    this.items.set(id, next);
    return next;
  }

  async findById(id: string): Promise<Comment | undefined> {
    return this.items.get(id);
  }

  async list(tenantId: string, filter: CommentFilter = {}): Promise<Comment[]> {
    const out: Comment[] = [];
    for (const c of this.items.values()) {
      if (c.tenantId !== tenantId) continue;
      if (filter.postId && c.postId !== filter.postId) continue;
      if (filter.status && c.status !== filter.status) continue;
      if (filter.parentId === null && c.parentId !== undefined) continue;
      if (typeof filter.parentId === 'string' && c.parentId !== filter.parentId) continue;
      out.push(c);
    }
    return out.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async countRecent(opts: {
    tenantId: string;
    ipAddress?: string;
    authorEmail?: string;
    sinceMs: number;
  }): Promise<number> {
    const cutoff = Date.now() - opts.sinceMs;
    let n = 0;
    for (const c of this.items.values()) {
      if (c.tenantId !== opts.tenantId) continue;
      if (c.createdAt.getTime() < cutoff) continue;
      if (opts.ipAddress && c.ipAddress !== opts.ipAddress) continue;
      if (opts.authorEmail && c.authorEmail !== opts.authorEmail) continue;
      n += 1;
    }
    return n;
  }
}
