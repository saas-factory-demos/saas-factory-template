/** 文章狀態。 */
export type PostStatus = 'draft' | 'published' | 'archived';

/** SEO 欄位（與 cms/pages 共用結構） */
export interface BlogSeo {
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  noindex?: boolean;
  nofollow?: boolean;
  keywords?: string[];
}

/** 作者。 */
export interface Author {
  id: string;
  tenantId: string;
  /** 顯示名稱 */
  name: string;
  /** Email（顯示用，需 verified flag） */
  email?: string;
  bio?: string;
  avatar?: string;
  /** 社群連結 */
  social?: { platform: string; url: string }[];
  /** 對應 user collection id（選填） */
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** 分類。 */
export interface Category {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  /** 分類圖示或封面 */
  cover?: string;
  parentId?: string;
  sortOrder?: number;
  createdAt: Date;
}

/** 標籤。 */
export interface Tag {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  createdAt: Date;
}

/** 系列文。 */
export interface PostSeries {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  cover?: string;
  createdAt: Date;
}

/** 留言來源（與 cms/comments 對應）。 */
export type CommentSource = 'builtin' | 'disqus' | 'disabled';

/**
 * 文章。
 */
export interface Post {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  /** 摘要（顯示在列表頁） */
  excerpt?: string;
  /** Lexical / rich text 序列化內容（不限定具體結構） */
  content: unknown;
  /** 純文字版本（給閱讀時間 / RSS / 搜尋用，於儲存時計算） */
  plainText?: string;
  featuredImage?: string;
  /** 分類 ID（單一） */
  categoryId?: string;
  /** 標籤 ID 列表 */
  tagIds: string[];
  /** 作者 ID 列表（支援多作者） */
  authorIds: string[];
  status: PostStatus;
  publishedAt?: Date;
  scheduledAt?: Date;
  /** 自動算出（每 200 中文字 / 250 英文字 = 1 分鐘） */
  readingTime: number;
  viewCount: number;
  seo?: BlogSeo;
  /** 手動指定的相關文章 ID（自動推薦會合併進來） */
  relatedPostIds: string[];
  /** 所屬系列 + 在系列中的順序 */
  seriesId?: string;
  seriesOrder?: number;
  /** 留言模式（覆寫全站預設） */
  commentSource?: CommentSource;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostInput {
  tenantId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: unknown;
  plainText?: string;
  featuredImage?: string;
  categoryId?: string;
  tagIds?: string[];
  authorIds: string[];
  status?: PostStatus;
  scheduledAt?: Date;
  seo?: BlogSeo;
  relatedPostIds?: string[];
  seriesId?: string;
  seriesOrder?: number;
  commentSource?: CommentSource;
}

export interface UpdatePostInput extends Partial<Omit<CreatePostInput, 'tenantId'>> {
  id: string;
}

/** RSS 來源 metadata。 */
export interface RssMetadata {
  title: string;
  description: string;
  link: string;
  /** RSS feed URL，例如 `https://shop.example.com/rss.xml` */
  feedUrl: string;
  language?: string;
}

/** 儲存層介面。 */
export interface BlogStore {
  // posts
  createPost(post: Post): Promise<Post>;
  updatePost(id: string, patch: Partial<Post>): Promise<Post>;
  findPostById(id: string): Promise<Post | undefined>;
  findPostBySlug(tenantId: string, slug: string): Promise<Post | undefined>;
  listPosts(
    tenantId: string,
    filter?: {
      status?: PostStatus;
      categoryId?: string;
      tagIds?: string[];
      authorId?: string;
      seriesId?: string;
    },
  ): Promise<Post[]>;
  deletePost(id: string): Promise<void>;

  // categories / tags / authors / series
  upsertCategory(category: Category): Promise<Category>;
  listCategories(tenantId: string): Promise<Category[]>;
  upsertTag(tag: Tag): Promise<Tag>;
  listTags(tenantId: string): Promise<Tag[]>;
  upsertAuthor(author: Author): Promise<Author>;
  listAuthors(tenantId: string): Promise<Author[]>;
  upsertSeries(series: PostSeries): Promise<PostSeries>;
  listSeries(tenantId: string): Promise<PostSeries[]>;
}
