import type {
  CustomerTier,
  LoyaltyProgramConfig,
  PointEntry,
  Redemption,
  RewardItem,
} from './types.js';

export interface PointEntryStore {
  insert(e: PointEntry): Promise<void>;
  update(e: PointEntry): Promise<void>;
  findById(id: string): Promise<PointEntry | undefined>;
  listByCustomer(tenantId: string, customerId: string): Promise<PointEntry[]>;
  /** 按 FIFO 排序的 earn 類未耗盡未過期紀錄。 */
  listEarnAvailable(tenantId: string, customerId: string): Promise<PointEntry[]>;
  /** 列出已到期但未沖銷的 earn 紀錄。 */
  listExpiredPending(tenantId: string, now: Date): Promise<PointEntry[]>;
}

export interface CustomerTierStore {
  upsert(t: CustomerTier): Promise<void>;
  findByCustomer(tenantId: string, customerId: string): Promise<CustomerTier | undefined>;
}

export interface RewardItemStore {
  insert(r: RewardItem): Promise<void>;
  update(r: RewardItem): Promise<void>;
  findById(id: string): Promise<RewardItem | undefined>;
  listActive(tenantId: string): Promise<RewardItem[]>;
}

export interface RedemptionStore {
  insert(r: Redemption): Promise<void>;
  update(r: Redemption): Promise<void>;
  findById(id: string): Promise<Redemption | undefined>;
  listByCustomer(tenantId: string, customerId: string): Promise<Redemption[]>;
}

export interface ProgramConfigStore {
  upsert(c: LoyaltyProgramConfig): Promise<void>;
  findByTenant(tenantId: string): Promise<LoyaltyProgramConfig | undefined>;
}

export class InMemoryPointEntryStore implements PointEntryStore {
  private map = new Map<string, PointEntry>();
  async insert(e: PointEntry): Promise<void> {
    if (this.map.has(e.id)) throw new Error(`point entry 已存在：${e.id}`);
    this.map.set(e.id, e);
  }
  async update(e: PointEntry): Promise<void> {
    if (!this.map.has(e.id)) throw new Error(`point entry 不存在：${e.id}`);
    this.map.set(e.id, e);
  }
  async findById(id: string): Promise<PointEntry | undefined> {
    return this.map.get(id);
  }
  async listByCustomer(tenantId: string, customerId: string): Promise<PointEntry[]> {
    return Array.from(this.map.values()).filter(
      (e) => e.tenantId === tenantId && e.customerId === customerId,
    );
  }
  async listEarnAvailable(tenantId: string, customerId: string): Promise<PointEntry[]> {
    return Array.from(this.map.values())
      .filter(
        (e) =>
          e.tenantId === tenantId &&
          e.customerId === customerId &&
          e.points > 0 &&
          !e.expired &&
          e.consumed < e.points,
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  async listExpiredPending(tenantId: string, now: Date): Promise<PointEntry[]> {
    return Array.from(this.map.values()).filter(
      (e) =>
        e.tenantId === tenantId &&
        e.points > 0 &&
        !e.expired &&
        e.expiresAt !== undefined &&
        e.expiresAt <= now &&
        e.consumed < e.points,
    );
  }
}

export class InMemoryCustomerTierStore implements CustomerTierStore {
  private map = new Map<string, CustomerTier>();
  private key(tenantId: string, customerId: string): string {
    return `${tenantId}|${customerId}`;
  }
  async upsert(t: CustomerTier): Promise<void> {
    this.map.set(this.key(t.tenantId, t.customerId), t);
  }
  async findByCustomer(tenantId: string, customerId: string): Promise<CustomerTier | undefined> {
    return this.map.get(this.key(tenantId, customerId));
  }
}

export class InMemoryRewardItemStore implements RewardItemStore {
  private map = new Map<string, RewardItem>();
  async insert(r: RewardItem): Promise<void> {
    if (this.map.has(r.id)) throw new Error(`reward 已存在：${r.id}`);
    this.map.set(r.id, r);
  }
  async update(r: RewardItem): Promise<void> {
    if (!this.map.has(r.id)) throw new Error(`reward 不存在：${r.id}`);
    this.map.set(r.id, r);
  }
  async findById(id: string): Promise<RewardItem | undefined> {
    return this.map.get(id);
  }
  async listActive(tenantId: string): Promise<RewardItem[]> {
    return Array.from(this.map.values()).filter(
      (r) => r.tenantId === tenantId && r.status === 'active',
    );
  }
}

export class InMemoryRedemptionStore implements RedemptionStore {
  private map = new Map<string, Redemption>();
  async insert(r: Redemption): Promise<void> {
    if (this.map.has(r.id)) throw new Error(`redemption 已存在：${r.id}`);
    this.map.set(r.id, r);
  }
  async update(r: Redemption): Promise<void> {
    if (!this.map.has(r.id)) throw new Error(`redemption 不存在：${r.id}`);
    this.map.set(r.id, r);
  }
  async findById(id: string): Promise<Redemption | undefined> {
    return this.map.get(id);
  }
  async listByCustomer(tenantId: string, customerId: string): Promise<Redemption[]> {
    return Array.from(this.map.values()).filter(
      (r) => r.tenantId === tenantId && r.customerId === customerId,
    );
  }
}

export class InMemoryProgramConfigStore implements ProgramConfigStore {
  private map = new Map<string, LoyaltyProgramConfig>();
  async upsert(c: LoyaltyProgramConfig): Promise<void> {
    this.map.set(c.tenantId, c);
  }
  async findByTenant(tenantId: string): Promise<LoyaltyProgramConfig | undefined> {
    return this.map.get(tenantId);
  }
}
