import { detectSpam } from './spam.js';

import type {
  Comment,
  CommentFilter,
  CommentServiceOptions,
  CommentStatus,
  CommentStore,
  CreateCommentInput,
} from './types.js';

const DEFAULTS = {
  minLength: 2,
  maxLength: 5000,
  maxLinks: 3,
  rateLimit: 5,
  rateLimitWindowMs: 60_000,
} as const;

/**
 * 留言服務（內建反垃圾 + honeypot + captcha + 後台審核）。
 */
export class CommentService {
  private readonly store: CommentStore;
  private readonly opts: Required<Omit<CommentServiceOptions, 'verifyCaptcha' | 'blockedKeywords'>> & {
    verifyCaptcha?: CommentServiceOptions['verifyCaptcha'];
    blockedKeywords: string[];
  };

  constructor(store: CommentStore, options: CommentServiceOptions = {}) {
    this.store = store;
    this.opts = {
      minLength: options.minLength ?? DEFAULTS.minLength,
      maxLength: options.maxLength ?? DEFAULTS.maxLength,
      maxLinks: options.maxLinks ?? DEFAULTS.maxLinks,
      rateLimit: options.rateLimit ?? DEFAULTS.rateLimit,
      rateLimitWindowMs: options.rateLimitWindowMs ?? DEFAULTS.rateLimitWindowMs,
      defaultStatus: options.defaultStatus ?? 'pending',
      blockedKeywords: options.blockedKeywords ?? [],
      verifyCaptcha: options.verifyCaptcha,
    };
  }

  private genId(): string {
    return `cmt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * 建立留言。
   * 流程：captcha → rate limit → spam 偵測 → 寫入（spam 標 spam、否則 pending）。
   */
  async createComment(input: CreateCommentInput): Promise<Comment> {
    if (this.opts.verifyCaptcha) {
      if (!input.captchaToken) throw new Error('缺少 captcha token');
      const ok = await this.opts.verifyCaptcha(input.captchaToken);
      if (!ok) throw new Error('captcha 驗證失敗');
    }

    if (input.ipAddress) {
      const recent = await this.store.countRecent({
        tenantId: input.tenantId,
        ipAddress: input.ipAddress,
        sinceMs: this.opts.rateLimitWindowMs,
      });
      if (recent >= this.opts.rateLimit) {
        throw new Error('留言過於頻繁，請稍後再試');
      }
    }

    const check = detectSpam(input.content, {
      honeypot: input.honeypot,
      blockedKeywords: this.opts.blockedKeywords,
      maxLinks: this.opts.maxLinks,
      minLength: this.opts.minLength,
      maxLength: this.opts.maxLength,
    });

    const now = new Date();
    const status: CommentStatus = check.isSpam ? 'spam' : this.opts.defaultStatus;
    const comment: Comment = {
      id: this.genId(),
      tenantId: input.tenantId,
      postId: input.postId,
      parentId: input.parentId,
      authorName: input.authorName,
      authorEmail: input.authorEmail,
      authorWebsite: input.authorWebsite,
      content: input.content,
      status,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      spamReasons: check.reasons.length > 0 ? check.reasons : undefined,
      createdAt: now,
      updatedAt: now,
    };
    return this.store.create(comment);
  }

  /** 核准留言（後台操作）。 */
  async approve(id: string): Promise<Comment> {
    return this.store.update(id, { status: 'approved' });
  }

  /** 標為垃圾（後台操作）。 */
  async markSpam(id: string): Promise<Comment> {
    return this.store.update(id, { status: 'spam' });
  }

  /** 拒絕留言（後台操作）。 */
  async reject(id: string): Promise<Comment> {
    return this.store.update(id, { status: 'rejected' });
  }

  /**
   * 列出指定文章的已核准留言（前台顯示用），依時間升冪。
   */
  async listApproved(tenantId: string, postId: string): Promise<Comment[]> {
    return this.store.list(tenantId, { postId, status: 'approved' });
  }

  /**
   * 列出待審核留言（後台用）。
   */
  async listPending(tenantId: string): Promise<Comment[]> {
    return this.store.list(tenantId, { status: 'pending' });
  }

  /**
   * 依「樹狀結構」回傳指定文章已核准留言（含 children 陣列）。
   */
  async listThread(
    tenantId: string,
    postId: string,
  ): Promise<Array<Comment & { children: Comment[] }>> {
    const all = await this.listApproved(tenantId, postId);
    const map = new Map<string, Comment & { children: Comment[] }>();
    for (const c of all) map.set(c.id, { ...c, children: [] });
    const roots: Array<Comment & { children: Comment[] }> = [];
    for (const node of map.values()) {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)?.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  /** 通用查詢（後台用）。 */
  async list(tenantId: string, filter?: CommentFilter): Promise<Comment[]> {
    return this.store.list(tenantId, filter);
  }
}
