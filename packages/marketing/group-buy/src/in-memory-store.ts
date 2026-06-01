import type { GroupBuyDeal, GroupBuyOrder } from './types.js';

export interface GroupBuyDealStore {
  insert(d: GroupBuyDeal): Promise<void>;
  update(d: GroupBuyDeal): Promise<void>;
  findById(id: string): Promise<GroupBuyDeal | undefined>;
  listOpenDue(tenantId: string, now: Date): Promise<GroupBuyDeal[]>;
}

export interface GroupBuyOrderStore {
  insert(o: GroupBuyOrder): Promise<void>;
  update(o: GroupBuyOrder): Promise<void>;
  findById(id: string): Promise<GroupBuyOrder | undefined>;
  listByDeal(dealId: string): Promise<GroupBuyOrder[]>;
}

export class InMemoryGroupBuyDealStore implements GroupBuyDealStore {
  private map = new Map<string, GroupBuyDeal>();
  async insert(d: GroupBuyDeal): Promise<void> {
    if (this.map.has(d.id)) throw new Error(`deal 已存在：${d.id}`);
    this.map.set(d.id, d);
  }
  async update(d: GroupBuyDeal): Promise<void> {
    if (!this.map.has(d.id)) throw new Error(`deal 不存在：${d.id}`);
    this.map.set(d.id, d);
  }
  async findById(id: string): Promise<GroupBuyDeal | undefined> {
    return this.map.get(id);
  }
  async listOpenDue(tenantId: string, now: Date): Promise<GroupBuyDeal[]> {
    return Array.from(this.map.values()).filter(
      (d) => d.tenantId === tenantId && d.status === 'open' && d.deadlineAt <= now,
    );
  }
}

export class InMemoryGroupBuyOrderStore implements GroupBuyOrderStore {
  private map = new Map<string, GroupBuyOrder>();
  async insert(o: GroupBuyOrder): Promise<void> {
    if (this.map.has(o.id)) throw new Error(`order 已存在：${o.id}`);
    this.map.set(o.id, o);
  }
  async update(o: GroupBuyOrder): Promise<void> {
    if (!this.map.has(o.id)) throw new Error(`order 不存在：${o.id}`);
    this.map.set(o.id, o);
  }
  async findById(id: string): Promise<GroupBuyOrder | undefined> {
    return this.map.get(id);
  }
  async listByDeal(dealId: string): Promise<GroupBuyOrder[]> {
    return Array.from(this.map.values()).filter((o) => o.dealId === dealId);
  }
}
