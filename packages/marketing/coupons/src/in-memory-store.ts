import type { CouponBatch, CouponCode, CouponRedemption } from './types.js';

export interface CouponBatchStore {
  insert(b: CouponBatch): Promise<void>;
  update(b: CouponBatch): Promise<void>;
  findById(id: string): Promise<CouponBatch | undefined>;
  listByTenant(tenantId: string): Promise<CouponBatch[]>;
}

export interface CouponCodeStore {
  insert(c: CouponCode): Promise<void>;
  update(c: CouponCode): Promise<void>;
  findByCode(tenantId: string, code: string): Promise<CouponCode | undefined>;
  listByBatch(batchId: string): Promise<CouponCode[]>;
  listExpiringInBatch(
    batchId: string,
    notNotifiedBefore: Date,
  ): Promise<CouponCode[]>;
}

export interface CouponRedemptionStore {
  insert(r: CouponRedemption): Promise<void>;
  listByBatch(batchId: string): Promise<CouponRedemption[]>;
  listByCustomer(tenantId: string, customerId: string): Promise<CouponRedemption[]>;
}

export class InMemoryCouponBatchStore implements CouponBatchStore {
  private map = new Map<string, CouponBatch>();
  async insert(b: CouponBatch): Promise<void> {
    if (this.map.has(b.id)) throw new Error(`batch 已存在：${b.id}`);
    this.map.set(b.id, b);
  }
  async update(b: CouponBatch): Promise<void> {
    if (!this.map.has(b.id)) throw new Error(`batch 不存在：${b.id}`);
    this.map.set(b.id, b);
  }
  async findById(id: string): Promise<CouponBatch | undefined> {
    return this.map.get(id);
  }
  async listByTenant(tenantId: string): Promise<CouponBatch[]> {
    return Array.from(this.map.values()).filter((b) => b.tenantId === tenantId);
  }
}

export class InMemoryCouponCodeStore implements CouponCodeStore {
  private byCode = new Map<string, CouponCode>();
  private key(t: string, c: string): string {
    return `${t}|${c}`;
  }
  async insert(c: CouponCode): Promise<void> {
    const k = this.key(c.tenantId, c.code);
    if (this.byCode.has(k)) throw new Error(`code 已存在：${c.code}`);
    this.byCode.set(k, c);
  }
  async update(c: CouponCode): Promise<void> {
    const k = this.key(c.tenantId, c.code);
    if (!this.byCode.has(k)) throw new Error(`code 不存在：${c.code}`);
    this.byCode.set(k, c);
  }
  async findByCode(tenantId: string, code: string): Promise<CouponCode | undefined> {
    return this.byCode.get(this.key(tenantId, code));
  }
  async listByBatch(batchId: string): Promise<CouponCode[]> {
    return Array.from(this.byCode.values()).filter((c) => c.batchId === batchId);
  }
  async listExpiringInBatch(
    batchId: string,
    notNotifiedBefore: Date,
  ): Promise<CouponCode[]> {
    return Array.from(this.byCode.values()).filter(
      (c) =>
        c.batchId === batchId &&
        c.usedCount === 0 &&
        (!c.notifiedExpiryAt || c.notifiedExpiryAt < notNotifiedBefore),
    );
  }
}

export class InMemoryCouponRedemptionStore implements CouponRedemptionStore {
  private list: CouponRedemption[] = [];
  async insert(r: CouponRedemption): Promise<void> {
    this.list.push(r);
  }
  async listByBatch(batchId: string): Promise<CouponRedemption[]> {
    return this.list.filter((r) => r.batchId === batchId);
  }
  async listByCustomer(tenantId: string, customerId: string): Promise<CouponRedemption[]> {
    return this.list.filter(
      (r) => r.tenantId === tenantId && r.customerId === customerId,
    );
  }
}
