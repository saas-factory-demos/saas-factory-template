import type {
  Affiliate,
  AffiliateStore,
  CommissionLedgerEntry,
  CommissionPolicy,
  OrderAttribution,
} from './types.js';

/** 記憶體版 AffiliateStore。 */
export class InMemoryAffiliateStore implements AffiliateStore {
  private readonly policies = new Map<string, CommissionPolicy>();
  private readonly affiliates = new Map<string, Affiliate>();
  private readonly attributions = new Map<string, OrderAttribution>();
  private readonly ledger = new Map<string, CommissionLedgerEntry>();

  async upsertPolicy(p: CommissionPolicy): Promise<void> {
    this.policies.set(p.id, p);
  }

  async findPolicy(tenantId: string, courseId: string): Promise<CommissionPolicy | undefined> {
    let tenantDefault: CommissionPolicy | undefined;
    for (const p of this.policies.values()) {
      if (p.tenantId !== tenantId) continue;
      if (p.scope === 'course' && p.courseId === courseId) return p;
      if (p.scope === 'tenant') tenantDefault = p;
    }
    return tenantDefault;
  }

  async upsertAffiliate(a: Affiliate): Promise<void> {
    this.affiliates.set(a.id, a);
  }

  async getAffiliate(id: string): Promise<Affiliate | undefined> {
    return this.affiliates.get(id);
  }

  async findAffiliateByCode(tenantId: string, code: string): Promise<Affiliate | undefined> {
    for (const a of this.affiliates.values()) {
      if (a.tenantId === tenantId && a.code === code) return a;
    }
    return undefined;
  }

  async upsertAttribution(a: OrderAttribution): Promise<void> {
    this.attributions.set(a.orderId, a);
  }

  async getAttribution(orderId: string): Promise<OrderAttribution | undefined> {
    return this.attributions.get(orderId);
  }

  async appendLedger(entry: CommissionLedgerEntry): Promise<void> {
    this.ledger.set(entry.id, entry);
  }

  async listLedgerByOrder(orderId: string): Promise<CommissionLedgerEntry[]> {
    return Array.from(this.ledger.values()).filter((e) => e.orderId === orderId);
  }

  async listLedgerByPayee(payeeId: string): Promise<CommissionLedgerEntry[]> {
    return Array.from(this.ledger.values()).filter((e) => e.payeeId === payeeId);
  }

  async updateLedgerStatus(id: string, status: CommissionLedgerEntry['status']): Promise<void> {
    const e = this.ledger.get(id);
    if (e) {
      e.status = status;
      this.ledger.set(id, e);
    }
  }
}
