/**
 * 點數服務。
 *
 * 規則：
 * - 賺點：依 PointsEarnRule 換算，寫入新 batch。
 * - 用點：FIFO，從最早到期的批次先扣（含優先扣將過期的）。
 * - 過期：sweep 流程把已過 expiresAt 的剩餘額轉為 expired，並寫 ledger。
 * - 後台手動加 / 扣：寫專用 batch（manual-add 為新 batch，manual-deduct 走 FIFO 扣）。
 */

import type {
  PointsBatch,
  PointsEarnRule,
  PointsLedger,
  PointsRedeemRule,
  PointsStore,
} from './types.js';
import type { DomainEvent } from '@saas-factory/events';


export interface PointsServiceConfig {
  emit?: (event: DomainEvent) => void;
  now?: () => Date;
  /** 預設賺點規則（可由 caller 覆寫）。 */
  earnRule?: PointsEarnRule;
  /** 預設用點規則。 */
  redeemRule?: PointsRedeemRule;
  /** 產生 batch / ledger id。 */
  idGenerator?: () => string;
}

export class PointsService {
  constructor(
    private readonly store: PointsStore,
    private readonly config: PointsServiceConfig = {},
  ) {}

  private now(): Date {
    return this.config.now?.() ?? new Date();
  }

  private genId(): string {
    return this.config.idGenerator?.() ?? `id-${this.now().getTime()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * 訂單完成後計算應賺點數並寫入。
   */
  async earnFromOrder(input: {
    userId: string;
    tenantId: string;
    spendAmount: number;
    orderId: string;
    rule?: PointsEarnRule;
    multiplierOverride?: number;
  }): Promise<{ points: number }> {
    const rule = input.rule ?? this.config.earnRule;
    if (!rule || rule.spendPerPoint <= 0) return { points: 0 };
    const base = Math.floor(input.spendAmount / rule.spendPerPoint);
    const multiplier = input.multiplierOverride ?? rule.multiplier ?? 1;
    const points = Math.floor(base * multiplier);
    if (points <= 0) return { points: 0 };

    const now = this.now();
    const batch: PointsBatch = {
      id: this.genId(),
      userId: input.userId,
      tenantId: input.tenantId,
      amount: points,
      consumed: 0,
      earnedAt: now.toISOString(),
      expiresAt: rule.expiryDays == null ? null : new Date(now.getTime() + rule.expiryDays * 86400000).toISOString(),
      source: 'order',
      sourceId: input.orderId,
      expired: false,
    };
    await this.store.saveBatch(batch);
    const balance = await this.getBalance(input.userId, input.tenantId);
    await this.store.appendLedger(this.makeLedger({
      userId: input.userId,
      tenantId: input.tenantId,
      delta: points,
      kind: 'earn',
      balanceAfter: balance,
      orderId: input.orderId,
    }));
    this.config.emit?.({
      type: 'points.earned',
      payload: {
        userId: input.userId,
        tenantId: input.tenantId,
        amount: points,
        source: 'order',
        sourceId: input.orderId,
      },
    });
    return { points };
  }

  /**
   * 將點數兌換為折抵金額。FIFO 扣點。
   */
  async redeem(input: {
    userId: string;
    tenantId: string;
    points: number;
    orderId?: string;
    rule?: PointsRedeemRule;
  }): Promise<{ ok: boolean; discountAmount: number; reason?: 'insufficient' | 'over-limit' }> {
    const rule = input.rule ?? this.config.redeemRule;
    if (!rule || rule.pointsPerCurrency <= 0) {
      return { ok: false, discountAmount: 0, reason: 'insufficient' };
    }
    if (input.points <= 0) return { ok: false, discountAmount: 0, reason: 'insufficient' };

    const balance = await this.getBalance(input.userId, input.tenantId);
    if (balance < input.points) return { ok: false, discountAmount: 0, reason: 'insufficient' };

    const discountAmount = Math.floor(input.points / rule.pointsPerCurrency);
    if (rule.maxRedeemAmount != null && discountAmount > rule.maxRedeemAmount) {
      return { ok: false, discountAmount: 0, reason: 'over-limit' };
    }
    if (discountAmount <= 0) return { ok: false, discountAmount: 0, reason: 'insufficient' };

    await this.consumeFifo(input.userId, input.tenantId, input.points);
    const after = await this.getBalance(input.userId, input.tenantId);
    await this.store.appendLedger(this.makeLedger({
      userId: input.userId,
      tenantId: input.tenantId,
      delta: -input.points,
      kind: 'redeem',
      balanceAfter: after,
      orderId: input.orderId,
    }));
    this.config.emit?.({
      type: 'points.redeemed',
      payload: {
        userId: input.userId,
        tenantId: input.tenantId,
        amount: input.points,
        orderId: input.orderId,
      },
    });
    return { ok: true, discountAmount };
  }

  /**
   * 後台手動加 / 扣（送禮 / 客訴補償）。
   */
  async manualAdjust(input: {
    userId: string;
    tenantId: string;
    delta: number;
    operatorUserId: string;
    reason?: string;
    expiryDays?: number | null;
  }): Promise<{ balance: number }> {
    const now = this.now();
    if (input.delta > 0) {
      const batch: PointsBatch = {
        id: this.genId(),
        userId: input.userId,
        tenantId: input.tenantId,
        amount: input.delta,
        consumed: 0,
        earnedAt: now.toISOString(),
        expiresAt:
          input.expiryDays == null
            ? null
            : new Date(now.getTime() + input.expiryDays * 86400000).toISOString(),
        source: 'manual',
        expired: false,
      };
      await this.store.saveBatch(batch);
    } else if (input.delta < 0) {
      await this.consumeFifo(input.userId, input.tenantId, -input.delta);
    }
    const balance = await this.getBalance(input.userId, input.tenantId);
    await this.store.appendLedger(
      this.makeLedger({
        userId: input.userId,
        tenantId: input.tenantId,
        delta: input.delta,
        kind: input.delta >= 0 ? 'manual-add' : 'manual-deduct',
        balanceAfter: balance,
        operatorUserId: input.operatorUserId,
        reason: input.reason,
      }),
    );
    return { balance };
  }

  /**
   * 取得目前可用餘額。
   */
  async getBalance(userId: string, tenantId: string): Promise<number> {
    const batches = await this.store.listActiveBatches(userId, tenantId, this.now());
    return batches.reduce((sum, b) => sum + (b.amount - b.consumed), 0);
  }

  /**
   * 過期 sweep（cron 定時跑）。
   */
  async sweepExpired(userId: string, tenantId: string): Promise<{ expiredTotal: number }> {
    const now = this.now();
    const all = await this.store.listAllBatches(userId, tenantId);
    let total = 0;
    for (const b of all) {
      if (b.expired) continue;
      if (b.expiresAt && new Date(b.expiresAt).getTime() <= now.getTime()) {
        const remaining = b.amount - b.consumed;
        if (remaining > 0) total += remaining;
        b.expired = true;
        b.consumed = b.amount;
        await this.store.updateBatch(b);
      }
    }
    if (total > 0) {
      const after = await this.getBalance(userId, tenantId);
      await this.store.appendLedger(
        this.makeLedger({
          userId,
          tenantId,
          delta: -total,
          kind: 'expire',
          balanceAfter: after,
        }),
      );
      this.config.emit?.({
        type: 'points.expired',
        payload: { userId, tenantId, amount: total },
      });
    }
    return { expiredTotal: total };
  }

  /**
   * FIFO 扣點，從最早到期的批次先扣。
   */
  private async consumeFifo(userId: string, tenantId: string, points: number): Promise<void> {
    const batches = await this.store.listActiveBatches(userId, tenantId, this.now());
    const sorted = [...batches].sort((a, b) => {
      const ax = a.expiresAt ? new Date(a.expiresAt).getTime() : Number.POSITIVE_INFINITY;
      const bx = b.expiresAt ? new Date(b.expiresAt).getTime() : Number.POSITIVE_INFINITY;
      if (ax !== bx) return ax - bx;
      return new Date(a.earnedAt).getTime() - new Date(b.earnedAt).getTime();
    });
    let remaining = points;
    for (const b of sorted) {
      if (remaining <= 0) break;
      const free = b.amount - b.consumed;
      const take = Math.min(free, remaining);
      b.consumed += take;
      remaining -= take;
      await this.store.updateBatch(b);
    }
    if (remaining > 0) {
      throw new Error('點數不足以扣除');
    }
  }

  private makeLedger(input: Omit<PointsLedger, 'id' | 'createdAt'>): PointsLedger {
    return {
      ...input,
      id: this.genId(),
      createdAt: this.now().toISOString(),
    };
  }
}
