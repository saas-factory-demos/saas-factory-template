/**
 * Upsell 服務：依位置挑出可顯示 offer + 互動統計。
 */

import type {
  Offer,
  OfferContext,
  OfferInteraction,
  OfferPlacement,
  OfferStats,
  OfferStore,
  OfferTrigger,
} from './types.js';

export interface UpsellServiceConfig {
  now?: () => Date;
  idGenerator?: () => string;
}

/**
 * Upsell 服務：
 *
 * - `pickOffer`：依位置取最佳一筆（priority 高者）。
 * - `pickOtoFunnel`：取出符合的 oto offer 依 funnelStep 排序。
 * - `record*` 系列：寫互動以供統計。
 */
export class UpsellService {
  constructor(
    private readonly store: OfferStore,
    private readonly config: UpsellServiceConfig = {},
  ) {}

  private now(): Date {
    return this.config.now?.() ?? new Date();
  }

  private genId(): string {
    return this.config.idGenerator?.() ?? `id-${this.now().getTime()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * 取出符合條件且 priority 最高的 offer。
   */
  async pickOffer(placement: OfferPlacement, context: OfferContext): Promise<Offer | null> {
    const offers = await this.eligibleOffers(placement, context);
    if (offers.length === 0) return null;
    return offers.sort((a, b) => b.priority - a.priority)[0] ?? null;
  }

  /**
   * 取出整套 OTO funnel（依 funnelStep 升冪）。
   */
  async pickOtoFunnel(context: OfferContext): Promise<Offer[]> {
    const offers = await this.eligibleOffers('oto', context);
    return offers.sort((a, b) => (a.funnelStep ?? 999) - (b.funnelStep ?? 999));
  }

  /**
   * 紀錄展示。
   */
  async recordShown(input: {
    tenantId: string;
    offerId: string;
    userId?: string;
    sessionId?: string;
  }): Promise<void> {
    await this.record(input.tenantId, input.offerId, 'shown', input.userId, input.sessionId);
  }

  /**
   * 紀錄接受。
   */
  async recordAccepted(input: {
    tenantId: string;
    offerId: string;
    userId?: string;
    sessionId?: string;
  }): Promise<void> {
    await this.record(input.tenantId, input.offerId, 'accepted', input.userId, input.sessionId);
  }

  /**
   * 紀錄拒絕。
   */
  async recordDeclined(input: {
    tenantId: string;
    offerId: string;
    userId?: string;
    sessionId?: string;
  }): Promise<void> {
    await this.record(input.tenantId, input.offerId, 'declined', input.userId, input.sessionId);
  }

  /**
   * 取得 offer 統計（shown / accepted / declined / acceptanceRate）。
   */
  async getStats(offerId: string): Promise<OfferStats> {
    const interactions = await this.store.listInteractions(offerId);
    const shown = interactions.filter((i) => i.event === 'shown').length;
    const accepted = interactions.filter((i) => i.event === 'accepted').length;
    const declined = interactions.filter((i) => i.event === 'declined').length;
    return {
      offerId,
      shown,
      accepted,
      declined,
      acceptanceRate: shown > 0 ? accepted / shown : 0,
    };
  }

  private async eligibleOffers(
    placement: OfferPlacement,
    context: OfferContext,
  ): Promise<Offer[]> {
    const offers = await this.store.listOffers(context.tenantId, placement);
    const now = (context.now ?? this.now()).getTime();
    return offers.filter((o) => {
      if (!o.active) return false;
      if (o.startsAt && new Date(o.startsAt).getTime() > now) return false;
      if (o.endsAt && new Date(o.endsAt).getTime() < now) return false;
      return o.triggers.every((t) => matchTrigger(t, context));
    });
  }

  private async record(
    tenantId: string,
    offerId: string,
    event: 'shown' | 'accepted' | 'declined',
    userId?: string,
    sessionId?: string,
  ): Promise<void> {
    const interaction: OfferInteraction = {
      id: this.genId(),
      tenantId,
      offerId,
      userId,
      sessionId,
      event,
      occurredAt: this.now().toISOString(),
    };
    await this.store.recordInteraction(interaction);
  }
}

function matchTrigger(trigger: OfferTrigger, context: OfferContext): boolean {
  switch (trigger.type) {
    case 'has_variant':
      return context.cart.some((i) => i.variantId === trigger.variantId);
    case 'has_category':
      return context.cart.some((i) => i.categoryIds?.includes(trigger.categoryId));
    case 'min_amount':
      return context.subtotal >= trigger.amount;
  }
}
