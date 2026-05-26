import type {
  Affiliate,
  AffiliateAttribution,
  Commission,
  Payout,
} from './types.js';

/** Affiliate 主檔 store。 */
export interface AffiliateStore {
  insert(a: Affiliate): Promise<void>;
  update(a: Affiliate): Promise<void>;
  findById(id: string): Promise<Affiliate | undefined>;
  findByCode(tenantId: string, code: string): Promise<Affiliate | undefined>;
  findByCustomer(tenantId: string, customerId: string): Promise<Affiliate | undefined>;
}

/** 歸因 store。 */
export interface AttributionStore {
  insert(a: AffiliateAttribution): Promise<void>;
  findByOrder(orderId: string): Promise<AffiliateAttribution | undefined>;
}

/** Commission store。 */
export interface CommissionStore {
  insert(c: Commission): Promise<void>;
  update(c: Commission): Promise<void>;
  findById(id: string): Promise<Commission | undefined>;
  listByAffiliate(tenantId: string, affiliateId: string): Promise<Commission[]>;
  listByOrder(orderId: string): Promise<Commission[]>;
  listDueForApproval(tenantId: string, now: Date): Promise<Commission[]>;
  listApprovedUnpaid(tenantId: string, affiliateId: string): Promise<Commission[]>;
}

/** Payout store。 */
export interface PayoutStore {
  insert(p: Payout): Promise<void>;
  update(p: Payout): Promise<void>;
  findById(id: string): Promise<Payout | undefined>;
  listByAffiliate(tenantId: string, affiliateId: string): Promise<Payout[]>;
}

/** In-memory 實作。 */
export class InMemoryAffiliateStore implements AffiliateStore {
  private map = new Map<string, Affiliate>();
  async insert(a: Affiliate): Promise<void> {
    if (this.map.has(a.id)) throw new Error(`affiliate 已存在：${a.id}`);
    this.map.set(a.id, a);
  }
  async update(a: Affiliate): Promise<void> {
    if (!this.map.has(a.id)) throw new Error(`affiliate 不存在：${a.id}`);
    this.map.set(a.id, a);
  }
  async findById(id: string): Promise<Affiliate | undefined> {
    return this.map.get(id);
  }
  async findByCode(tenantId: string, code: string): Promise<Affiliate | undefined> {
    return Array.from(this.map.values()).find((a) => a.tenantId === tenantId && a.code === code);
  }
  async findByCustomer(tenantId: string, customerId: string): Promise<Affiliate | undefined> {
    return Array.from(this.map.values()).find(
      (a) => a.tenantId === tenantId && a.customerId === customerId,
    );
  }
}

export class InMemoryAttributionStore implements AttributionStore {
  private map = new Map<string, AffiliateAttribution>();
  async insert(a: AffiliateAttribution): Promise<void> {
    if (this.map.has(a.orderId)) throw new Error(`order 已有歸因：${a.orderId}`);
    this.map.set(a.orderId, a);
  }
  async findByOrder(orderId: string): Promise<AffiliateAttribution | undefined> {
    return this.map.get(orderId);
  }
}

export class InMemoryCommissionStore implements CommissionStore {
  private map = new Map<string, Commission>();
  async insert(c: Commission): Promise<void> {
    if (this.map.has(c.id)) throw new Error(`commission 已存在：${c.id}`);
    this.map.set(c.id, c);
  }
  async update(c: Commission): Promise<void> {
    if (!this.map.has(c.id)) throw new Error(`commission 不存在：${c.id}`);
    this.map.set(c.id, c);
  }
  async findById(id: string): Promise<Commission | undefined> {
    return this.map.get(id);
  }
  async listByAffiliate(tenantId: string, affiliateId: string): Promise<Commission[]> {
    return Array.from(this.map.values()).filter(
      (c) => c.tenantId === tenantId && c.affiliateId === affiliateId,
    );
  }
  async listByOrder(orderId: string): Promise<Commission[]> {
    return Array.from(this.map.values()).filter((c) => c.orderId === orderId);
  }
  async listDueForApproval(tenantId: string, now: Date): Promise<Commission[]> {
    return Array.from(this.map.values()).filter(
      (c) => c.tenantId === tenantId && c.status === 'pending' && c.releaseAt <= now,
    );
  }
  async listApprovedUnpaid(tenantId: string, affiliateId: string): Promise<Commission[]> {
    return Array.from(this.map.values()).filter(
      (c) =>
        c.tenantId === tenantId &&
        c.affiliateId === affiliateId &&
        c.status === 'approved' &&
        !c.payoutId,
    );
  }
}

export class InMemoryPayoutStore implements PayoutStore {
  private map = new Map<string, Payout>();
  async insert(p: Payout): Promise<void> {
    if (this.map.has(p.id)) throw new Error(`payout 已存在：${p.id}`);
    this.map.set(p.id, p);
  }
  async update(p: Payout): Promise<void> {
    if (!this.map.has(p.id)) throw new Error(`payout 不存在：${p.id}`);
    this.map.set(p.id, p);
  }
  async findById(id: string): Promise<Payout | undefined> {
    return this.map.get(id);
  }
  async listByAffiliate(tenantId: string, affiliateId: string): Promise<Payout[]> {
    return Array.from(this.map.values()).filter(
      (p) => p.tenantId === tenantId && p.affiliateId === affiliateId,
    );
  }
}
