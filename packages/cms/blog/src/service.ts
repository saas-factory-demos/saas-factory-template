import { extractPlainText, estimateReadingTime } from './reading-time.js';
import { suggestRelated } from './related.js';
import { generateRss } from './rss.js';

import type {
  Author,
  BlogStore,
  Category,
  CreatePostInput,
  Post,
  PostSeries,
  PostStatus,
  RssMetadata,
  Tag,
  UpdatePostInput,
} from './types.js';

/**
 * 部落格服務。
 */
export class BlogService {
  private readonly store: BlogStore;

  constructor(store: BlogStore) {
    this.store = store;
  }

  private genId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * 建立文章（自動估算 reading time + 萃取 plainText）。
   */
  async createPost(input: CreatePostInput): Promise<Post> {
    if (input.authorIds.length === 0) {
      throw new Error('至少要指定一位作者');
    }
    const existing = await this.store.findPostBySlug(input.tenantId, input.slug);
    if (existing) throw new Error(`slug 已存在：${input.slug}`);

    const plainText = input.plainText ?? extractPlainText(input.content);
    const readingTime = estimateReadingTime(plainText);
    const now = new Date();
    const status: PostStatus = input.status ?? 'draft';
    const post: Post = {
      id: this.genId('post'),
      tenantId: input.tenantId,
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      plainText,
      featuredImage: input.featuredImage,
      categoryId: input.categoryId,
      tagIds: input.tagIds ?? [],
      authorIds: input.authorIds,
      status,
      publishedAt: status === 'published' ? now : undefined,
      scheduledAt: input.scheduledAt,
      readingTime,
      viewCount: 0,
      seo: input.seo,
      relatedPostIds: input.relatedPostIds ?? [],
      seriesId: input.seriesId,
      seriesOrder: input.seriesOrder,
      commentSource: input.commentSource,
      createdAt: now,
      updatedAt: now,
    };
    return this.store.createPost(post);
  }

  /**
   * 更新文章。
   */
  async updatePost(input: UpdatePostInput): Promise<Post> {
    const cur = await this.store.findPostById(input.id);
    if (!cur) throw new Error(`Post 不存在：${input.id}`);
    const patch: Partial<Post> = { ...input };
    if (input.content !== undefined) {
      const plainText = input.plainText ?? extractPlainText(input.content);
      patch.plainText = plainText;
      patch.readingTime = estimateReadingTime(plainText);
    }
    return this.store.updatePost(input.id, patch);
  }

  /**
   * 發布文章。
   */
  async publishPost(id: string): Promise<Post> {
    return this.store.updatePost(id, { status: 'published', publishedAt: new Date() });
  }

  /**
   * 排程發布。
   */
  async schedulePost(id: string, when: Date): Promise<Post> {
    if (when.getTime() <= Date.now()) {
      throw new Error('scheduledAt 必須為未來時間');
    }
    return this.store.updatePost(id, { status: 'draft', scheduledAt: when });
  }

  /**
   * 把所有到期 draft 文章切為 published。
   */
  async publishScheduled(tenantId: string, now: Date = new Date()): Promise<Post[]> {
    const list = await this.store.listPosts(tenantId, { status: 'draft' });
    const due = list.filter((p) => p.scheduledAt && p.scheduledAt.getTime() <= now.getTime());
    const out: Post[] = [];
    for (const p of due) {
      out.push(await this.store.updatePost(p.id, { status: 'published', publishedAt: now }));
    }
    return out;
  }

  /**
   * 封存文章。
   */
  async archivePost(id: string): Promise<Post> {
    return this.store.updatePost(id, { status: 'archived' });
  }

  /**
   * 增加閱讀次數（給前台呼叫）。僅對 published 文章計次，避免 draft 預覽刷數。
   */
  async incrementView(id: string): Promise<Post> {
    const cur = await this.store.findPostById(id);
    if (!cur) throw new Error(`Post 不存在：${id}`);
    if (cur.status !== 'published') {
      throw new Error('文章未發布，無法計算閱讀次數');
    }
    return this.store.updatePost(id, { viewCount: cur.viewCount + 1 });
  }

  /**
   * 前台用：依 slug 取已發布文章。draft / archived 不會回傳，
   * 避免前台路由不小心抓到草稿造成 SEO 污染或私密內容外洩。
   */
  async findPublishedBySlug(tenantId: string, slug: string): Promise<Post | undefined> {
    const post = await this.store.findPostBySlug(tenantId, slug);
    if (!post || post.status !== 'published') return undefined;
    return post;
  }

  /**
   * 前台用：依 id 取已發布文章。
   */
  async findPublishedById(id: string): Promise<Post | undefined> {
    const post = await this.store.findPostById(id);
    if (!post || post.status !== 'published') return undefined;
    return post;
  }

  /**
   * 後台用：依 slug 取任意狀態的文章（含 draft / archived）。
   * 呼叫端必須自行做權限檢查，前台路由請改用 `findPublishedBySlug`。
   */
  async findAnyBySlug(tenantId: string, slug: string): Promise<Post | undefined> {
    return this.store.findPostBySlug(tenantId, slug);
  }

  /**
   * 後台用：依 id 取任意狀態的文章。權限檢查由呼叫端負責。
   */
  async findAnyById(id: string): Promise<Post | undefined> {
    return this.store.findPostById(id);
  }

  /**
   * 取得指定文章的相關文章（自動推薦 + 手動指定合併去重）。
   */
  async getRelated(postId: string, limit = 5): Promise<Post[]> {
    const target = await this.store.findPostById(postId);
    if (!target) return [];
    const pool = await this.store.listPosts(target.tenantId, { status: 'published' });
    const auto = suggestRelated(target, pool, { limit });
    const manualIds = target.relatedPostIds ?? [];
    const manual = pool.filter((p) => manualIds.includes(p.id));
    const merged: Post[] = [];
    const seen = new Set<string>();
    for (const p of [...manual, ...auto]) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      merged.push(p);
      if (merged.length >= limit) break;
    }
    return merged;
  }

  /**
   * 系列文：列出某系列的所有文章，依 seriesOrder 排序。
   */
  async listSeriesPosts(tenantId: string, seriesId: string): Promise<Post[]> {
    const all = await this.store.listPosts(tenantId, { seriesId, status: 'published' });
    return all.sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
  }

  /**
   * 產生 RSS feed。
   */
  async generateRssFeed(tenantId: string, metadata: RssMetadata): Promise<string> {
    const posts = await this.store.listPosts(tenantId, { status: 'published' });
    return generateRss(posts, metadata);
  }

  /**
   * 列出已發布文章，可指定分類 / 標籤 / 作者 / 系列。
   */
  async listPublished(
    tenantId: string,
    filter?: { categoryId?: string; tagIds?: string[]; authorId?: string; seriesId?: string },
  ): Promise<Post[]> {
    const list = await this.store.listPosts(tenantId, { ...filter, status: 'published' });
    return list.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  }

  // ── Taxonomy helpers ─────────────────────────────────────────────

  async createCategory(input: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    return this.store.upsertCategory({
      ...input,
      id: this.genId('cat'),
      createdAt: new Date(),
    });
  }

  async createTag(input: Omit<Tag, 'id' | 'createdAt'>): Promise<Tag> {
    return this.store.upsertTag({
      ...input,
      id: this.genId('tag'),
      createdAt: new Date(),
    });
  }

  async createAuthor(input: Omit<Author, 'id' | 'createdAt' | 'updatedAt'>): Promise<Author> {
    const now = new Date();
    return this.store.upsertAuthor({
      ...input,
      id: this.genId('author'),
      createdAt: now,
      updatedAt: now,
    });
  }

  async createSeries(input: Omit<PostSeries, 'id' | 'createdAt'>): Promise<PostSeries> {
    return this.store.upsertSeries({
      ...input,
      id: this.genId('series'),
      createdAt: new Date(),
    });
  }
}
