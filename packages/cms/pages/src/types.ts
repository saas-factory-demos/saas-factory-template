import type { BlockInstance } from '@saas-factory/factory-types';

/** 頁面狀態。 */
export type PageStatus = 'draft' | 'published' | 'archived';

/**
 * SEO meta 欄位（與 cms/seo 套件共用）。
 */
export interface SeoFields {
  /** title 標籤；為空時 fallback page.title */
  metaTitle?: string;
  /** description；建議 50~160 字 */
  metaDescription?: string;
  /** canonical URL（指向其他 URL 時填） */
  canonical?: string;
  /** OG image（覆蓋自動產生） */
  ogImage?: string;
  /** 排除搜尋引擎 */
  noindex?: boolean;
  /** 不傳遞連結權重 */
  nofollow?: boolean;
  /** 自訂 OG title */
  ogTitle?: string;
  /** 自訂 OG description */
  ogDescription?: string;
  /** 額外 keyword 標籤（用於後台搜尋與內部索引） */
  keywords?: string[];
}

/**
 * 單一頁面。
 *
 * `layout` 用 `@saas-factory/factory-types.BlockInstance`（FrontendBlockKey + variant + config），
 * 與 wizard / template-writer / blocks-library / BlockRenderer 共用同一份 source-of-truth。
 */
export interface Page {
  id: string;
  tenantId: string;
  /** 頁面標題（後台用 + fallback metaTitle） */
  title: string;
  /** URL slug（不含 / 開頭，僅本層 slug，例如「about」） */
  slug: string;
  /** 父頁面 ID（null 表示頂層） */
  parentId?: string;
  /** 頁面內容（BlockInstance 陣列） */
  layout: BlockInstance[];
  /** 狀態 */
  status: PageStatus;
  /** 發布時間（status=published 時填） */
  publishedAt?: Date;
  /** 排程發布時間 */
  scheduledAt?: Date;
  /** SEO 欄位 */
  seo?: SeoFields;
  /** 是否為「首頁」（只能有一個） */
  isHomepage?: boolean;
  /** 後台排序（同層級 sort） */
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

/** 建立頁面輸入。 */
export type CreatePageInput = Omit<
  Page,
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'publishedAt'
> & {
  status?: PageStatus;
};

/** 更新頁面輸入。 */
export type UpdatePageInput = Partial<
  Omit<Page, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
> & {
  id: string;
};

/**
 * 頁面儲存層介面。
 */
export interface PageStore {
  create(page: Page): Promise<Page>;
  update(id: string, patch: Partial<Page>): Promise<Page>;
  findById(id: string): Promise<Page | undefined>;
  findBySlug(tenantId: string, parentId: string | undefined, slug: string): Promise<Page | undefined>;
  listByTenant(tenantId: string): Promise<Page[]>;
  delete(id: string): Promise<void>;
}

/**
 * Layout 驗證結果（service 內用 BLOCK_REGISTRY Zod schema 計算）。
 */
export interface LayoutValidationResult {
  valid: boolean;
  /** key 為 block.id，value 為錯誤訊息列表 */
  errors: Record<string, string[]>;
}
