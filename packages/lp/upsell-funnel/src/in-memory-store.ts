import type { UpsellOfferStats, UpsellSession } from './types.js';

/** Upsell session 儲存介面。 */
export interface UpsellSessionStore {
  insert(session: UpsellSession): Promise<void>;
  findById(id: string): Promise<UpsellSession | undefined>;
  update(session: UpsellSession): Promise<void>;
}

/** OTO 事件儲存（views / accepts / skips）。 */
export interface UpsellEventStore {
  recordView(tenantId: string, offerId: string): Promise<void>;
  recordAccept(tenantId: string, offerId: string): Promise<void>;
  recordSkip(tenantId: string, offerId: string): Promise<void>;
  stats(tenantId: string, offerId: string): Promise<UpsellOfferStats>;
}

/** 測試 / 本機 in-memory session 實作。 */
export class InMemoryUpsellSessionStore implements UpsellSessionStore {
  private sessions = new Map<string, UpsellSession>();

  async insert(session: UpsellSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async findById(id: string): Promise<UpsellSession | undefined> {
    return this.sessions.get(id);
  }

  async update(session: UpsellSession): Promise<void> {
    if (!this.sessions.has(session.id)) throw new Error(`找不到 session：${session.id}`);
    this.sessions.set(session.id, session);
  }
}

/** 測試 / 本機 in-memory 事件實作。 */
export class InMemoryUpsellEventStore implements UpsellEventStore {
  private buckets = new Map<string, { views: number; accepts: number; skips: number }>();

  private key(tenantId: string, offerId: string): string {
    return `${tenantId}|${offerId}`;
  }

  private bucket(tenantId: string, offerId: string) {
    const k = this.key(tenantId, offerId);
    let b = this.buckets.get(k);
    if (!b) {
      b = { views: 0, accepts: 0, skips: 0 };
      this.buckets.set(k, b);
    }
    return b;
  }

  async recordView(tenantId: string, offerId: string): Promise<void> {
    this.bucket(tenantId, offerId).views += 1;
  }

  async recordAccept(tenantId: string, offerId: string): Promise<void> {
    this.bucket(tenantId, offerId).accepts += 1;
  }

  async recordSkip(tenantId: string, offerId: string): Promise<void> {
    this.bucket(tenantId, offerId).skips += 1;
  }

  async stats(tenantId: string, offerId: string): Promise<UpsellOfferStats> {
    const b = this.bucket(tenantId, offerId);
    const acceptRate = b.views === 0 ? 0 : b.accepts / b.views;
    return { offerId, views: b.views, accepts: b.accepts, skips: b.skips, acceptRate };
  }
}
