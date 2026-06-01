import type { CustomerProfile, Segment } from './types.js';

export interface SegmentStore {
  insert(s: Segment): Promise<void>;
  update(s: Segment): Promise<void>;
  findById(id: string): Promise<Segment | undefined>;
  listByTenant(tenantId: string): Promise<Segment[]>;
}

export interface CustomerProfileStore {
  upsert(p: CustomerProfile): Promise<void>;
  get(tenantId: string, customerId: string): Promise<CustomerProfile | undefined>;
  listByTenant(tenantId: string): Promise<CustomerProfile[]>;
}

export class InMemorySegmentStore implements SegmentStore {
  private map = new Map<string, Segment>();
  async insert(s: Segment): Promise<void> {
    if (this.map.has(s.id)) throw new Error(`segment 已存在：${s.id}`);
    this.map.set(s.id, s);
  }
  async update(s: Segment): Promise<void> {
    if (!this.map.has(s.id)) throw new Error(`segment 不存在：${s.id}`);
    this.map.set(s.id, s);
  }
  async findById(id: string): Promise<Segment | undefined> {
    return this.map.get(id);
  }
  async listByTenant(tenantId: string): Promise<Segment[]> {
    return Array.from(this.map.values()).filter((s) => s.tenantId === tenantId);
  }
}

export class InMemoryCustomerProfileStore implements CustomerProfileStore {
  private map = new Map<string, CustomerProfile>();
  private key(t: string, c: string): string {
    return `${t}|${c}`;
  }
  async upsert(p: CustomerProfile): Promise<void> {
    this.map.set(this.key(p.tenantId, p.customerId), p);
  }
  async get(tenantId: string, customerId: string): Promise<CustomerProfile | undefined> {
    return this.map.get(this.key(tenantId, customerId));
  }
  async listByTenant(tenantId: string): Promise<CustomerProfile[]> {
    return Array.from(this.map.values()).filter((p) => p.tenantId === tenantId);
  }
}
