/**
 * 測試用 in-memory store。
 */

import type { Offer, OfferInteraction, OfferPlacement, OfferStore } from './types.js';

export class InMemoryOfferStore implements OfferStore {
  offers = new Map<string, Offer>();
  interactions: OfferInteraction[] = [];

  async listOffers(tenantId: string, placement: OfferPlacement): Promise<Offer[]> {
    return Array.from(this.offers.values()).filter(
      (o) => o.tenantId === tenantId && o.placement === placement,
    );
  }

  async getOffer(id: string): Promise<Offer | null> {
    return this.offers.get(id) ?? null;
  }

  async saveOffer(offer: Offer): Promise<void> {
    this.offers.set(offer.id, offer);
  }

  async recordInteraction(interaction: OfferInteraction): Promise<void> {
    this.interactions.push(interaction);
  }

  async listInteractions(offerId: string): Promise<OfferInteraction[]> {
    return this.interactions.filter((i) => i.offerId === offerId);
  }
}
