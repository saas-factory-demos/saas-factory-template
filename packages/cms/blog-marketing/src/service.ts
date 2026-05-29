import { buildShareUrl, type SharePlatform } from './share-links.js';

import type {
  BlogMarketingStore,
  CtaBlock,
  LeadCapture,
  LeadMagnet,
  MarketingStats,
  NewsletterSubscriber,
} from './types.js';

/** Email 寄送介面（給 lead magnet / newsletter 確認信用）。 */
export type EmailSender = (msg: {
  to: string;
  subject: string;
  html: string;
}) => Promise<void>;

/** 行銷自動化觸發接口（goal-07 整合，例：lead-captured / newsletter-confirmed）。 */
export type MarketingTrigger = (event: {
  tenantId: string;
  eventId: string;
  payload: Record<string, unknown>;
}) => Promise<void>;

/** Service 設定。 */
export interface BlogMarketingServiceOptions {
  emailSender?: EmailSender;
  marketingTrigger?: MarketingTrigger;
  /** double opt-in 確認頁面 base URL，產生連結用。 */
  confirmBaseUrl?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 部落格行銷服務（CTA + lead magnet + newsletter + share + 點擊追蹤）。
 */
export class BlogMarketingService {
  private readonly store: BlogMarketingStore;
  private readonly opts: BlogMarketingServiceOptions;

  constructor(store: BlogMarketingStore, options: BlogMarketingServiceOptions = {}) {
    this.store = store;
    this.opts = options;
  }

  private genId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // ── CTA ──────────────────────────────────────────────────────────────

  async upsertCta(input: {
    id?: string;
    tenantId: string;
    name: string;
    placement: CtaBlock['placement'];
    heading: string;
    body?: string;
    buttonLabel: string;
    buttonUrl: string;
    categoryIds?: string[];
    tagIds?: string[];
    weight?: number;
    enabled?: boolean;
  }): Promise<CtaBlock> {
    const now = new Date();
    const existing = input.id ? await this.store.findCtaById(input.id) : undefined;
    const cta: CtaBlock = {
      id: existing?.id ?? this.genId('cta'),
      tenantId: input.tenantId,
      name: input.name,
      placement: input.placement,
      heading: input.heading,
      body: input.body,
      buttonLabel: input.buttonLabel,
      buttonUrl: input.buttonUrl,
      categoryIds: input.categoryIds ?? [],
      tagIds: input.tagIds ?? [],
      weight: input.weight ?? 1,
      enabled: input.enabled ?? true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    return this.store.upsertCta(cta);
  }

  /**
   * 取得指定文章可用的 CTA（依 placement + 分類 / 標籤過濾）。
   *
   * 規則：
   * - 全站 CTA（無 categoryIds / tagIds）一律列入
   * - 命中 categoryIds 或 tagIds 的 CTA 列入
   * - 依 weight 排序
   */
  async pickCtasForPost(input: {
    tenantId: string;
    postCategoryId?: string;
    postTagIds?: string[];
    placement: CtaBlock['placement'];
  }): Promise<CtaBlock[]> {
    const list = await this.store.listCtas(input.tenantId);
    const matched = list.filter((c) => {
      if (!c.enabled) return false;
      if (c.placement !== input.placement) return false;
      const isGlobal = c.categoryIds.length === 0 && c.tagIds.length === 0;
      if (isGlobal) return true;
      if (input.postCategoryId && c.categoryIds.includes(input.postCategoryId)) return true;
      if (
        input.postTagIds &&
        c.tagIds.some((t) => (input.postTagIds ?? []).includes(t))
      ) {
        return true;
      }
      return false;
    });
    return matched.sort((a, b) => b.weight - a.weight);
  }

  /** 記錄 CTA 點擊。 */
  async recordCtaClick(input: { tenantId: string; ctaId: string; postId?: string }): Promise<void> {
    await this.store.recordClickEvent({
      id: this.genId('evt'),
      tenantId: input.tenantId,
      source: 'cta',
      entityId: input.ctaId,
      postId: input.postId,
      createdAt: new Date(),
    });
  }

  // ── Lead magnet ──────────────────────────────────────────────────────

  async upsertMagnet(input: {
    id?: string;
    tenantId: string;
    name: string;
    slug: string;
    description?: string;
    fileUrl: string;
    fileName: string;
    thumbnailUrl?: string;
    enabled?: boolean;
  }): Promise<LeadMagnet> {
    const now = new Date();
    const existing = input.id ? await this.store.findMagnetById(input.id) : undefined;
    const magnet: LeadMagnet = {
      id: existing?.id ?? this.genId('mag'),
      tenantId: input.tenantId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      thumbnailUrl: input.thumbnailUrl,
      enabled: input.enabled ?? true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    return this.store.upsertMagnet(magnet);
  }

  /**
   * 用 email 換下載：建立 lead capture + 觸發行銷事件 + 回傳下載 URL。
   */
  async requestMagnetDownload(input: {
    tenantId: string;
    magnetSlug: string;
    email: string;
    name?: string;
    sourcePostId?: string;
    ipAddress?: string;
  }): Promise<{ fileUrl: string; fileName: string; leadId: string }> {
    if (!EMAIL_RE.test(input.email)) throw new Error('email 格式錯誤');
    const magnet = await this.store.findMagnetBySlug(input.tenantId, input.magnetSlug);
    if (!magnet) throw new Error(`找不到 lead magnet：${input.magnetSlug}`);
    if (!magnet.enabled) throw new Error('lead magnet 未啟用');

    const lead: LeadCapture = {
      id: this.genId('lead'),
      tenantId: input.tenantId,
      email: input.email.toLowerCase(),
      name: input.name,
      magnetId: magnet.id,
      sourcePostId: input.sourcePostId,
      ipAddress: input.ipAddress,
      createdAt: new Date(),
    };
    await this.store.createLeadCapture(lead);
    await this.store.recordClickEvent({
      id: this.genId('evt'),
      tenantId: input.tenantId,
      source: 'lead-magnet',
      entityId: magnet.id,
      postId: input.sourcePostId,
      createdAt: new Date(),
    });
    if (this.opts.marketingTrigger) {
      await this.opts.marketingTrigger({
        tenantId: input.tenantId,
        eventId: 'lead-captured',
        payload: {
          email: lead.email,
          name: lead.name,
          magnetSlug: magnet.slug,
          sourcePostId: input.sourcePostId,
        },
      });
    }
    return { fileUrl: magnet.fileUrl, fileName: magnet.fileName, leadId: lead.id };
  }

  async listLeadCaptures(tenantId: string, magnetId?: string): Promise<LeadCapture[]> {
    return this.store.listLeadCaptures(tenantId, magnetId);
  }

  // ── Newsletter ───────────────────────────────────────────────────────

  /**
   * 訂閱 newsletter（double opt-in：建立 confirmed=false + 寄確認信）。
   * 已訂閱（confirmed）的 email 不重複建立。
   */
  async subscribeNewsletter(input: {
    tenantId: string;
    email: string;
    name?: string;
    source?: string;
  }): Promise<NewsletterSubscriber> {
    if (!EMAIL_RE.test(input.email)) throw new Error('email 格式錯誤');
    const email = input.email.toLowerCase();
    const existing = await this.store.findSubscriberByEmail(input.tenantId, email);
    if (existing && existing.confirmed && !existing.unsubscribedAt) {
      return existing;
    }
    const now = new Date();
    const sub: NewsletterSubscriber = existing ?? {
      id: this.genId('sub'),
      tenantId: input.tenantId,
      email,
      name: input.name,
      source: input.source,
      confirmed: false,
      createdAt: now,
      updatedAt: now,
    };
    const merged: NewsletterSubscriber = {
      ...sub,
      name: input.name ?? sub.name,
      source: input.source ?? sub.source,
      confirmed: false,
      unsubscribedAt: undefined,
      updatedAt: now,
    };
    await this.store.upsertSubscriber(merged);
    if (this.opts.emailSender && this.opts.confirmBaseUrl) {
      const link = `${this.opts.confirmBaseUrl.replace(/\/+$/, '')}/${merged.id}`;
      await this.opts.emailSender({
        to: merged.email,
        subject: '請確認您的訂閱',
        html: `<p>感謝您訂閱！請點擊連結確認：<a href="${link}">${link}</a></p>`,
      });
    }
    return merged;
  }

  /** 點擊確認連結：把 confirmed 設 true。 */
  async confirmSubscriber(id: string): Promise<NewsletterSubscriber> {
    const sub = await this.store.findSubscriberById(id);
    if (!sub) throw new Error(`訂閱者不存在：${id}`);
    const updated: NewsletterSubscriber = { ...sub, confirmed: true, updatedAt: new Date() };
    await this.store.upsertSubscriber(updated);
    if (this.opts.marketingTrigger) {
      await this.opts.marketingTrigger({
        tenantId: sub.tenantId,
        eventId: 'newsletter-confirmed',
        payload: { email: sub.email, source: sub.source },
      });
    }
    return updated;
  }

  /** 退訂。 */
  async unsubscribe(input: { tenantId: string; email: string }): Promise<NewsletterSubscriber> {
    const sub = await this.store.findSubscriberByEmail(input.tenantId, input.email);
    if (!sub) throw new Error('訂閱者不存在');
    const updated: NewsletterSubscriber = { ...sub, unsubscribedAt: new Date(), updatedAt: new Date() };
    await this.store.upsertSubscriber(updated);
    return updated;
  }

  async listSubscribers(tenantId: string): Promise<NewsletterSubscriber[]> {
    return this.store.listSubscribers(tenantId);
  }

  // ── Share & 點擊追蹤 ─────────────────────────────────────────────────

  /**
   * 取得單篇文章在所有平台的分享 URL。
   */
  buildShareUrls(postUrl: string, postTitle: string): Record<SharePlatform, string> {
    const platforms: SharePlatform[] = [
      'facebook',
      'twitter',
      'line',
      'telegram',
      'whatsapp',
      'email',
      'copy-link',
    ];
    const out = {} as Record<SharePlatform, string>;
    for (const p of platforms) out[p] = buildShareUrl(p, postUrl, postTitle);
    return out;
  }

  /** 記錄分享點擊（哪篇文章被分享到哪個平台）。 */
  async recordShareClick(input: {
    tenantId: string;
    postId: string;
    channel: SharePlatform;
  }): Promise<void> {
    await this.store.recordClickEvent({
      id: this.genId('evt'),
      tenantId: input.tenantId,
      source: 'share',
      entityId: `${input.postId}:${input.channel}`,
      channel: input.channel,
      postId: input.postId,
      createdAt: new Date(),
    });
  }

  // ── 統計 ─────────────────────────────────────────────────────────────

  /**
   * 取得指定 tenant 的整體行銷統計。
   */
  async getStats(tenantId: string): Promise<MarketingStats> {
    const events = await this.store.listClickEvents(tenantId);
    const ctaClicks: Record<string, number> = {};
    const magnetDownloads: Record<string, number> = {};
    const shareClicks: Record<string, Record<string, number>> = {};
    for (const e of events) {
      if (e.source === 'cta') {
        ctaClicks[e.entityId] = (ctaClicks[e.entityId] ?? 0) + 1;
      } else if (e.source === 'lead-magnet') {
        magnetDownloads[e.entityId] = (magnetDownloads[e.entityId] ?? 0) + 1;
      } else if (e.source === 'share' && e.postId && e.channel) {
        const post = shareClicks[e.postId] ?? {};
        post[e.channel] = (post[e.channel] ?? 0) + 1;
        shareClicks[e.postId] = post;
      }
    }
    return { ctaClicks, magnetDownloads, shareClicks };
  }
}
