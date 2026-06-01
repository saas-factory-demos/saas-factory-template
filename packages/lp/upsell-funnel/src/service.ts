import type { UpsellEventStore, UpsellSessionStore } from './in-memory-store.js';
import type {
  UpsellFunnelConfig,
  UpsellOffer,
  UpsellOfferStats,
  UpsellSession,
  UpsellStep,
} from './types.js';

/** 一鍵加購扣款 hook（外層接金流：用先前訂單的卡片 token / Stripe customer 重扣）。 */
export type OneClickChargeHook = (input: {
  orderId: string;
  offer: UpsellOffer;
  effectivePriceMinor: number;
}) => Promise<{ success: boolean; chargeId?: string; reason?: string }>;

/** 啟動 funnel 的輸入。 */
export interface StartFunnelInput {
  orderId: string;
  config: UpsellFunnelConfig;
  /** 主訂單是否已留付款憑證；false 時無法一鍵加購，funnel 直接到感謝頁。 */
  hasStoredPayment: boolean;
}

/** Upsell funnel 服務。狀態機 + 事件統計。 */
export class UpsellFunnelService {
  constructor(
    private readonly sessions: UpsellSessionStore,
    private readonly events: UpsellEventStore,
    private readonly options: {
      now?: () => Date;
      genId?: () => string;
      charge?: OneClickChargeHook;
    } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(): string {
    return this.options.genId ? this.options.genId() : `us_${Math.random().toString(36).slice(2, 10)}`;
  }

  private effectivePrice(offer: UpsellOffer): number {
    return offer.discountedPriceMinor ?? offer.priceMinor;
  }

  /** 開始 funnel。沒有卡片或沒有 OTO 都直接拋到感謝頁。 */
  async start(input: StartFunnelInput): Promise<{ session: UpsellSession; step: UpsellStep }> {
    const session: UpsellSession = {
      id: this.genId(),
      tenantId: input.config.tenantId,
      orderId: input.orderId,
      funnelConfig: input.config,
      cursor: 0,
      acceptedOfferIds: [],
      skippedOfferIds: [],
      upsellTotalMinor: 0,
      done: false,
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    if (!input.hasStoredPayment || input.config.offers.length === 0) {
      session.done = true;
      session.cursor = input.config.offers.length;
    }
    await this.sessions.insert(session);
    return { session, step: await this.peek(session) };
  }

  /** 看目前該顯示的步驟（不變更 state）。 */
  async peek(session: UpsellSession): Promise<UpsellStep> {
    if (session.done || session.cursor >= session.funnelConfig.offers.length) {
      return { kind: 'thank-you', slug: session.funnelConfig.thankYouSlug };
    }
    const offer = session.funnelConfig.offers[session.cursor]!;
    await this.events.recordView(session.tenantId, offer.id);
    return {
      kind: 'offer',
      offer,
      index: session.cursor,
      total: session.funnelConfig.offers.length,
    };
  }

  /** 接受目前 OTO：呼叫扣款 hook，成功才前進；失敗回 success=false，cursor 不動。 */
  async accept(sessionId: string): Promise<{ session: UpsellSession; step: UpsellStep; chargeId?: string }> {
    const session = await this.requireSession(sessionId);
    const offer = this.currentOffer(session);
    const price = this.effectivePrice(offer);
    if (!this.options.charge) {
      throw new Error('未注入 OneClickChargeHook，無法處理加購');
    }
    const result = await this.options.charge({
      orderId: session.orderId,
      offer,
      effectivePriceMinor: price,
    });
    if (!result.success) {
      throw new Error(`加購扣款失敗：${result.reason ?? 'unknown'}`);
    }
    await this.events.recordAccept(session.tenantId, offer.id);
    const updated: UpsellSession = {
      ...session,
      cursor: session.cursor + 1,
      acceptedOfferIds: [...session.acceptedOfferIds, offer.id],
      upsellTotalMinor: session.upsellTotalMinor + price,
      done: session.cursor + 1 >= session.funnelConfig.offers.length,
      updatedAt: this.now(),
    };
    await this.sessions.update(updated);
    return { session: updated, step: await this.peek(updated), chargeId: result.chargeId };
  }

  /** 跳過目前 OTO。 */
  async skip(sessionId: string): Promise<{ session: UpsellSession; step: UpsellStep }> {
    const session = await this.requireSession(sessionId);
    const offer = this.currentOffer(session);
    await this.events.recordSkip(session.tenantId, offer.id);
    const updated: UpsellSession = {
      ...session,
      cursor: session.cursor + 1,
      skippedOfferIds: [...session.skippedOfferIds, offer.id],
      done: session.cursor + 1 >= session.funnelConfig.offers.length,
      updatedAt: this.now(),
    };
    await this.sessions.update(updated);
    return { session: updated, step: await this.peek(updated) };
  }

  /** 取得某個 offer 的統計（後台分析）。 */
  async statsOf(tenantId: string, offerId: string): Promise<UpsellOfferStats> {
    return this.events.stats(tenantId, offerId);
  }

  private async requireSession(id: string): Promise<UpsellSession> {
    const session = await this.sessions.findById(id);
    if (!session) throw new Error(`找不到 upsell session：${id}`);
    if (session.done) throw new Error('funnel 已結束');
    return session;
  }

  private currentOffer(session: UpsellSession): UpsellOffer {
    const offer = session.funnelConfig.offers[session.cursor];
    if (!offer) throw new Error('沒有可顯示的 OTO');
    return offer;
  }
}
