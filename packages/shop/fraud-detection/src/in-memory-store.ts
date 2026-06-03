import type {
  BlacklistEntry,
  CustomerRiskMark,
  FraudStore,
  OrderRecord,
} from './types.js';

/**
 * 記憶體儲存實作（測試 / 開發用）。
 */
export class InMemoryFraudStore implements FraudStore {
  private blacklist = new Map<string, BlacklistEntry>();
  private riskMarks = new Map<string, CustomerRiskMark>();
  private orders = new Map<string, OrderRecord>();

  async listActiveBlacklist(tenantId: string, now: Date): Promise<BlacklistEntry[]> {
    const list: BlacklistEntry[] = [];
    for (const entry of this.blacklist.values()) {
      if (entry.tenantId !== tenantId) continue;
      if (entry.expiresAt && entry.expiresAt.getTime() <= now.getTime()) continue;
      list.push(entry);
    }
    return list;
  }

  async upsertBlacklist(entry: BlacklistEntry): Promise<BlacklistEntry> {
    this.blacklist.set(entry.id, entry);
    return entry;
  }

  async deleteBlacklist(id: string): Promise<void> {
    this.blacklist.delete(id);
  }

  async getCustomerRisk(
    tenantId: string,
    key: { userId?: string; email?: string },
  ): Promise<CustomerRiskMark | undefined> {
    for (const mark of this.riskMarks.values()) {
      if (mark.tenantId !== tenantId) continue;
      if (key.userId && mark.userId === key.userId) return mark;
      if (key.email && mark.email === key.email) return mark;
    }
    return undefined;
  }

  async upsertCustomerRisk(mark: CustomerRiskMark): Promise<CustomerRiskMark> {
    this.riskMarks.set(mark.id, mark);
    return mark;
  }

  async listOrdersByIp(
    tenantId: string,
    ip: string,
    since: Date,
  ): Promise<OrderRecord[]> {
    const list: OrderRecord[] = [];
    for (const o of this.orders.values()) {
      if (o.tenantId !== tenantId) continue;
      if (o.ip !== ip) continue;
      if (o.createdAt.getTime() < since.getTime()) continue;
      list.push(o);
    }
    return list;
  }

  async listOrdersByCustomer(
    tenantId: string,
    key: { userId?: string; email?: string },
    since: Date,
  ): Promise<OrderRecord[]> {
    const list: OrderRecord[] = [];
    for (const o of this.orders.values()) {
      if (o.tenantId !== tenantId) continue;
      if (o.createdAt.getTime() < since.getTime()) continue;
      if (key.userId && o.userId === key.userId) list.push(o);
      else if (key.email && o.email === key.email) list.push(o);
    }
    return list;
  }

  async recordOrder(order: OrderRecord): Promise<OrderRecord> {
    this.orders.set(order.id, order);
    return order;
  }

  async markRejected(orderId: string): Promise<void> {
    const o = this.orders.get(orderId);
    if (o) {
      this.orders.set(orderId, { ...o, rejected: true });
    }
  }
}
