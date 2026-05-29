/** 站內 CTA 元件（可插在文章中或文章結尾）。 */
export interface CtaBlock {
  id: string;
  tenantId: string;
  name: string;
  /** 顯示位置：文章內嵌 / 文章結尾 / 側邊欄。 */
  placement: 'inline' | 'end-of-post' | 'sidebar';
  heading: string;
  body?: string;
  buttonLabel: string;
  buttonUrl: string;
  /** 鎖定特定分類 / 標籤（空 = 全站套用）。 */
  categoryIds: string[];
  tagIds: string[];
  /** A/B 變體的權重（給多 CTA 隨機抽）。預設 1。 */
  weight: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Lead magnet（電子書 / 範本 / Checklist，email 換下載）。 */
export interface LeadMagnet {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  /** 下載檔 URL（R2 / S3）。 */
  fileUrl: string;
  fileName: string;
  /** 顯示用縮圖。 */
  thumbnailUrl?: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Lead 蒐集紀錄（email 換下載產生的潛在客戶）。 */
export interface LeadCapture {
  id: string;
  tenantId: string;
  email: string;
  name?: string;
  /** 透過哪個 lead magnet 來。 */
  magnetId: string;
  /** 從哪篇文章導過來（給歸因用）。 */
  sourcePostId?: string;
  ipAddress?: string;
  createdAt: Date;
}

/** Newsletter 訂閱者。 */
export interface NewsletterSubscriber {
  id: string;
  tenantId: string;
  email: string;
  name?: string;
  /** 訂閱來源（文章 slug / lead-magnet / popup）。 */
  source?: string;
  /** double opt-in 確認狀態。 */
  confirmed: boolean;
  /** 退訂時間。 */
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** 點擊事件（CTA / lead-magnet / share 通用）。 */
export interface ClickEvent {
  id: string;
  tenantId: string;
  /** cta / lead-magnet / share-link。 */
  source: 'cta' | 'lead-magnet' | 'share';
  /** 對應的 entity id（ctaId / magnetId / postId+platform）。 */
  entityId: string;
  /** share 用：facebook / twitter / line / telegram / whatsapp / email / copy-link。 */
  channel?: string;
  /** 從哪個 post 觸發。 */
  postId?: string;
  createdAt: Date;
}

/** 統計結果。 */
export interface MarketingStats {
  ctaClicks: Record<string, number>;
  magnetDownloads: Record<string, number>;
  shareClicks: Record<string, Record<string, number>>;
}

/** 儲存層介面。 */
export interface BlogMarketingStore {
  upsertCta(cta: CtaBlock): Promise<CtaBlock>;
  findCtaById(id: string): Promise<CtaBlock | undefined>;
  listCtas(tenantId: string): Promise<CtaBlock[]>;

  upsertMagnet(m: LeadMagnet): Promise<LeadMagnet>;
  findMagnetById(id: string): Promise<LeadMagnet | undefined>;
  findMagnetBySlug(tenantId: string, slug: string): Promise<LeadMagnet | undefined>;
  listMagnets(tenantId: string): Promise<LeadMagnet[]>;

  createLeadCapture(lead: LeadCapture): Promise<LeadCapture>;
  listLeadCaptures(tenantId: string, magnetId?: string): Promise<LeadCapture[]>;

  upsertSubscriber(sub: NewsletterSubscriber): Promise<NewsletterSubscriber>;
  findSubscriberById(id: string): Promise<NewsletterSubscriber | undefined>;
  findSubscriberByEmail(
    tenantId: string,
    email: string,
  ): Promise<NewsletterSubscriber | undefined>;
  listSubscribers(tenantId: string): Promise<NewsletterSubscriber[]>;

  recordClickEvent(event: ClickEvent): Promise<ClickEvent>;
  listClickEvents(tenantId: string, source?: ClickEvent['source']): Promise<ClickEvent[]>;
}
