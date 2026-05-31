import type {
  Author,
  BlogStore,
  Category,
  Post,
  PostSeries,
  PostStatus,
  Tag,
} from './types.js';

/**
 * 記憶體 BlogStore。
 */
export class InMemoryBlogStore implements BlogStore {
  private posts = new Map<string, Post>();
  private categories = new Map<string, Category>();
  private tags = new Map<string, Tag>();
  private authors = new Map<string, Author>();
  private series = new Map<string, PostSeries>();

  async createPost(post: Post): Promise<Post> {
    this.posts.set(post.id, post);
    return post;
  }
  async updatePost(id: string, patch: Partial<Post>): Promise<Post> {
    const cur = this.posts.get(id);
    if (!cur) throw new Error(`Post 不存在：${id}`);
    const updated = { ...cur, ...patch, updatedAt: new Date() };
    this.posts.set(id, updated);
    return updated;
  }
  async findPostById(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  async findPostBySlug(tenantId: string, slug: string): Promise<Post | undefined> {
    for (const p of this.posts.values()) {
      if (p.tenantId === tenantId && p.slug === slug) return p;
    }
    return undefined;
  }
  async listPosts(
    tenantId: string,
    filter?: {
      status?: PostStatus;
      categoryId?: string;
      tagIds?: string[];
      authorId?: string;
      seriesId?: string;
    },
  ): Promise<Post[]> {
    const list: Post[] = [];
    for (const p of this.posts.values()) {
      if (p.tenantId !== tenantId) continue;
      if (filter?.status && p.status !== filter.status) continue;
      if (filter?.categoryId && p.categoryId !== filter.categoryId) continue;
      if (filter?.tagIds && !filter.tagIds.every((t) => p.tagIds.includes(t))) continue;
      if (filter?.authorId && !p.authorIds.includes(filter.authorId)) continue;
      if (filter?.seriesId && p.seriesId !== filter.seriesId) continue;
      list.push(p);
    }
    return list;
  }
  async deletePost(id: string): Promise<void> {
    this.posts.delete(id);
  }

  async upsertCategory(c: Category): Promise<Category> {
    this.categories.set(c.id, c);
    return c;
  }
  async listCategories(tenantId: string): Promise<Category[]> {
    return [...this.categories.values()].filter((c) => c.tenantId === tenantId);
  }

  async upsertTag(t: Tag): Promise<Tag> {
    this.tags.set(t.id, t);
    return t;
  }
  async listTags(tenantId: string): Promise<Tag[]> {
    return [...this.tags.values()].filter((t) => t.tenantId === tenantId);
  }

  async upsertAuthor(a: Author): Promise<Author> {
    this.authors.set(a.id, a);
    return a;
  }
  async listAuthors(tenantId: string): Promise<Author[]> {
    return [...this.authors.values()].filter((a) => a.tenantId === tenantId);
  }

  async upsertSeries(s: PostSeries): Promise<PostSeries> {
    this.series.set(s.id, s);
    return s;
  }
  async listSeries(tenantId: string): Promise<PostSeries[]> {
    return [...this.series.values()].filter((s) => s.tenantId === tenantId);
  }
}
