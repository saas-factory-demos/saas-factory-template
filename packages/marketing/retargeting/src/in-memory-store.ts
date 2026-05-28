import type {
  CustomerActivity,
  CustomerLifecycle,
  ProductView,
  RetargetTask,
} from './types.js';

/** 客戶活動 store。 */
export interface CustomerActivityStore {
  get(tenantId: string, customerId: string): Promise<CustomerActivity | undefined>;
  upsert(a: CustomerActivity): Promise<void>;
  listByTenant(tenantId: string): Promise<CustomerActivity[]>;
}

/** Lifecycle store。 */
export interface CustomerLifecycleStore {
  get(tenantId: string, customerId: string): Promise<CustomerLifecycle | undefined>;
  upsert(l: CustomerLifecycle): Promise<void>;
  listByStage(tenantId: string, stage: CustomerLifecycle['stage']): Promise<CustomerLifecycle[]>;
}

/** 商品瀏覽 store。 */
export interface ProductViewStore {
  insert(v: ProductView): Promise<void>;
  listRecent(tenantId: string, customerId: string, since: Date): Promise<ProductView[]>;
}

/** Retarget task store。 */
export interface RetargetTaskStore {
  insert(t: RetargetTask): Promise<void>;
  update(t: RetargetTask): Promise<void>;
  findById(id: string): Promise<RetargetTask | undefined>;
  listDue(tenantId: string, now: Date): Promise<RetargetTask[]>;
  listByCustomer(tenantId: string, customerId: string): Promise<RetargetTask[]>;
}

/** In-memory 實作。 */
export class InMemoryCustomerActivityStore implements CustomerActivityStore {
  private map = new Map<string, CustomerActivity>();
  private key(t: string, c: string): string {
    return `${t}|${c}`;
  }
  async get(tenantId: string, customerId: string): Promise<CustomerActivity | undefined> {
    return this.map.get(this.key(tenantId, customerId));
  }
  async upsert(a: CustomerActivity): Promise<void> {
    this.map.set(this.key(a.tenantId, a.customerId), a);
  }
  async listByTenant(tenantId: string): Promise<CustomerActivity[]> {
    return Array.from(this.map.values()).filter((a) => a.tenantId === tenantId);
  }
}

export class InMemoryCustomerLifecycleStore implements CustomerLifecycleStore {
  private map = new Map<string, CustomerLifecycle>();
  private key(t: string, c: string): string {
    return `${t}|${c}`;
  }
  async get(tenantId: string, customerId: string): Promise<CustomerLifecycle | undefined> {
    return this.map.get(this.key(tenantId, customerId));
  }
  async upsert(l: CustomerLifecycle): Promise<void> {
    this.map.set(this.key(l.tenantId, l.customerId), l);
  }
  async listByStage(tenantId: string, stage: CustomerLifecycle['stage']): Promise<CustomerLifecycle[]> {
    return Array.from(this.map.values()).filter((l) => l.tenantId === tenantId && l.stage === stage);
  }
}

export class InMemoryProductViewStore implements ProductViewStore {
  private list: ProductView[] = [];
  async insert(v: ProductView): Promise<void> {
    this.list.push(v);
  }
  async listRecent(tenantId: string, customerId: string, since: Date): Promise<ProductView[]> {
    return this.list.filter(
      (v) => v.tenantId === tenantId && v.customerId === customerId && v.at >= since,
    );
  }
}

export class InMemoryRetargetTaskStore implements RetargetTaskStore {
  private map = new Map<string, RetargetTask>();
  async insert(t: RetargetTask): Promise<void> {
    this.map.set(t.id, t);
  }
  async update(t: RetargetTask): Promise<void> {
    if (!this.map.has(t.id)) throw new Error(`找不到 task：${t.id}`);
    this.map.set(t.id, t);
  }
  async findById(id: string): Promise<RetargetTask | undefined> {
    return this.map.get(id);
  }
  async listDue(tenantId: string, now: Date): Promise<RetargetTask[]> {
    return Array.from(this.map.values()).filter(
      (t) => t.tenantId === tenantId && t.status === 'pending' && t.scheduledAt <= now,
    );
  }
  async listByCustomer(tenantId: string, customerId: string): Promise<RetargetTask[]> {
    return Array.from(this.map.values()).filter(
      (t) => t.tenantId === tenantId && t.customerId === customerId,
    );
  }
}
