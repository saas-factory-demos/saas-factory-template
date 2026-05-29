import type { CodBlacklistEntry, CodOrder } from './types.js';

/** COD 訂單儲存介面。 */
export interface CodOrderStore {
  insert(order: CodOrder): Promise<void>;
  findById(id: string): Promise<CodOrder | undefined>;
  update(order: CodOrder): Promise<void>;
  listByTenant(tenantId: string): Promise<CodOrder[]>;
  /** 計算指定時窗內某 phone 已建立的 COD 訂單數（給 velocity 防呆用）。 */
  countByPhoneSince(tenantId: string, phone: string, since: Date): Promise<number>;
}

/** 黑名單儲存介面。 */
export interface CodBlacklistStore {
  get(tenantId: string, phone: string): Promise<CodBlacklistEntry | undefined>;
  upsert(entry: CodBlacklistEntry): Promise<void>;
}

/** In-memory 訂單實作。 */
export class InMemoryCodOrderStore implements CodOrderStore {
  private map = new Map<string, CodOrder>();

  async insert(order: CodOrder): Promise<void> {
    this.map.set(order.id, order);
  }

  async findById(id: string): Promise<CodOrder | undefined> {
    return this.map.get(id);
  }

  async update(order: CodOrder): Promise<void> {
    if (!this.map.has(order.id)) throw new Error(`找不到 COD 訂單：${order.id}`);
    this.map.set(order.id, order);
  }

  async listByTenant(tenantId: string): Promise<CodOrder[]> {
    return Array.from(this.map.values()).filter((o) => o.tenantId === tenantId);
  }

  async countByPhoneSince(tenantId: string, phone: string, since: Date): Promise<number> {
    return Array.from(this.map.values()).filter(
      (o) =>
        o.tenantId === tenantId &&
        o.customer.phone === phone &&
        o.createdAt.getTime() >= since.getTime(),
    ).length;
  }
}

/** In-memory 黑名單實作。 */
export class InMemoryCodBlacklistStore implements CodBlacklistStore {
  private map = new Map<string, CodBlacklistEntry>();

  private key(tenantId: string, phone: string): string {
    return `${tenantId}|${phone}`;
  }

  async get(tenantId: string, phone: string): Promise<CodBlacklistEntry | undefined> {
    return this.map.get(this.key(tenantId, phone));
  }

  async upsert(entry: CodBlacklistEntry): Promise<void> {
    this.map.set(this.key(entry.tenantId, entry.phone), entry);
  }
}
