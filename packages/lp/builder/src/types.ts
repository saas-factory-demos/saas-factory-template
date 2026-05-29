/** 一頁式銷售網站（LP）。 */
export interface LpPage {
  id: string;
  tenantId: string;
  slug: string;
  title: string;
  /** 區塊清單（順序即顯示順序）。 */
  blocks: LpBlock[];
  /** SEO meta。 */
  seo?: LpSeo;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  /** 排程上線時間（>now 則自動發布）。 */
  scheduledPublishAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** 區塊。 */
export interface LpBlock {
  /** 區塊執行個體 id（同一頁不重複）。 */
  id: string;
  /** 區塊類型（hero / faq / checkout-form 等）。 */
  type: string;
  /** 是否啟用（停用則前台不渲染）。 */
  enabled: boolean;
  /** 區塊資料（每 type 有自己的 schema，由 lp/blocks 套件驗證）。 */
  props: Record<string, unknown>;
}

/** SEO meta。 */
export interface LpSeo {
  title?: string;
  description?: string;
  ogImage?: string;
  noIndex?: boolean;
}

/** LP store 介面。 */
export interface LpPageStore {
  get(id: string): Promise<LpPage | undefined>;
  findBySlug(tenantId: string, slug: string): Promise<LpPage | undefined>;
  upsert(p: LpPage): Promise<void>;
  list(tenantId: string): Promise<LpPage[]>;
}
