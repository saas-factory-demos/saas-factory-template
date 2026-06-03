import type { CouponClaim, RecoveryAttempt } from './types.js';

/** Attempt 儲存介面。 */
export interface RecoveryAttemptStore {
  insert(a: RecoveryAttempt): Promise<void>;
  update(a: RecoveryAttempt): Promise<void>;
  findById(id: string): Promise<RecoveryAttempt | undefined>;
  listDue(tenantId: string, now: Date): Promise<RecoveryAttempt[]>;
  listByCart(cartId: string): Promise<RecoveryAttempt[]>;
  listByTenant(tenantId: string): Promise<RecoveryAttempt[]>;
}

/** 折扣領取 quota 儲存。 */
export interface CouponClaimStore {
  insert(c: CouponClaim): Promise<void>;
  countForMonth(tenantId: string, customerId: string, year: number, month: number): Promise<number>;
}

/** In-memory Attempt 實作。 */
export class InMemoryRecoveryAttemptStore implements RecoveryAttemptStore {
  private map = new Map<string, RecoveryAttempt>();

  async insert(a: RecoveryAttempt): Promise<void> {
    this.map.set(a.id, a);
  }

  async update(a: RecoveryAttempt): Promise<void> {
    if (!this.map.has(a.id)) throw new Error(`找不到 attempt：${a.id}`);
    this.map.set(a.id, a);
  }

  async findById(id: string): Promise<RecoveryAttempt | undefined> {
    return this.map.get(id);
  }

  async listDue(tenantId: string, now: Date): Promise<RecoveryAttempt[]> {
    return Array.from(this.map.values()).filter(
      (a) => a.tenantId === tenantId && a.status === 'pending' && a.scheduledAt <= now,
    );
  }

  async listByCart(cartId: string): Promise<RecoveryAttempt[]> {
    return Array.from(this.map.values()).filter((a) => a.cartId === cartId);
  }

  async listByTenant(tenantId: string): Promise<RecoveryAttempt[]> {
    return Array.from(this.map.values()).filter((a) => a.tenantId === tenantId);
  }
}

/** In-memory 折扣 quota 實作。 */
export class InMemoryCouponClaimStore implements CouponClaimStore {
  private list: CouponClaim[] = [];

  async insert(c: CouponClaim): Promise<void> {
    this.list.push(c);
  }

  async countForMonth(
    tenantId: string,
    customerId: string,
    year: number,
    month: number,
  ): Promise<number> {
    return this.list.filter(
      (c) =>
        c.tenantId === tenantId &&
        c.customerId === customerId &&
        c.at.getUTCFullYear() === year &&
        c.at.getUTCMonth() === month,
    ).length;
  }
}
