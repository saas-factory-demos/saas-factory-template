import { randomBytes } from 'node:crypto';

import type {
  CouponClaimStore,
  RecoveryAttemptStore,
} from './in-memory-store.js';
import type {
  CartSnapshot,
  ChannelSender,
  RecoveryAttempt,
  RecoveryChannel,
  RecoveryFlowConfig,
  RecoveryFunnelStats,
  SendOutcome,
} from './types.js';

/** 棄單回收服務。 */
export class AbandonedCartService {
  constructor(
    private readonly attempts: RecoveryAttemptStore,
    private readonly claims: CouponClaimStore,
    private readonly sender: ChannelSender,
    private readonly options: {
      now?: () => Date;
      genId?: () => string;
    } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(): string {
    return this.options.genId ? this.options.genId() : `att_${randomBytes(5).toString('hex')}`;
  }

  /** 上游 cart 服務在偵測到 abandoned 時呼叫，依 config 排定多段跟催。 */
  async scheduleRecovery(snapshot: CartSnapshot, config: RecoveryFlowConfig): Promise<RecoveryAttempt[]> {
    const created: RecoveryAttempt[] = [];
    for (let i = 0; i < config.stages.length; i++) {
      const stage = config.stages[i]!;
      if (stage.minOrderMinor !== undefined && snapshot.totalMinor < stage.minOrderMinor) {
        continue;
      }
      const att: RecoveryAttempt = {
        id: this.genId(),
        tenantId: snapshot.tenantId,
        cartId: snapshot.cartId,
        customerId: snapshot.customerId,
        stageIndex: i,
        scheduledAt: new Date(snapshot.lastActivityAt.getTime() + stage.delayMs),
        status: 'pending',
        results: [],
        cartSnapshot: snapshot,
        createdAt: this.now(),
        updatedAt: this.now(),
      };
      await this.attempts.insert(att);
      created.push(att);
    }
    return created;
  }

  /** 上游 cart 服務通知客戶恢復活動：取消所有 pending attempt。 */
  async cancelByCart(cartId: string, reason: string): Promise<RecoveryAttempt[]> {
    const list = await this.attempts.listByCart(cartId);
    const cancelled: RecoveryAttempt[] = [];
    for (const a of list) {
      if (a.status === 'pending') {
        const updated: RecoveryAttempt = {
          ...a,
          status: 'skipped',
          results: [...a.results, { channel: 'email', outcome: 'failed', at: this.now(), reason }],
          updatedAt: this.now(),
        };
        await this.attempts.update(updated);
        cancelled.push(updated);
      }
    }
    return cancelled;
  }

  /** Worker 拉到時 due 的 attempts → 套用 config 對應 stage → 對所有 channel fan-out。 */
  async dispatchDue(tenantId: string, config: RecoveryFlowConfig, now: Date = this.now()): Promise<RecoveryAttempt[]> {
    const due = await this.attempts.listDue(tenantId, now);
    const out: RecoveryAttempt[] = [];
    for (const a of due) {
      const stage = config.stages[a.stageIndex];
      if (!stage) continue;
      const updated = await this.send(a, stage, config);
      out.push(updated);
    }
    return out;
  }

  /** 對單一 attempt 執行發送（給測試 / 後台手動觸發用）。 */
  async send(
    attempt: RecoveryAttempt,
    stage: RecoveryFlowConfig['stages'][number],
    config: RecoveryFlowConfig,
  ): Promise<RecoveryAttempt> {
    const results: RecoveryAttempt['results'] = [...attempt.results];
    let couponCode = stage.couponCode;
    if (couponCode && config.maxDiscountPerCustomerPerMonth !== undefined) {
      const t = this.now();
      const count = await this.claims.countForMonth(
        attempt.tenantId,
        attempt.customerId,
        t.getUTCFullYear(),
        t.getUTCMonth(),
      );
      if (count >= config.maxDiscountPerCustomerPerMonth) {
        couponCode = undefined; // 超 quota：仍寄信但不附碼
      }
    }

    for (const ch of stage.channels) {
      const r = await this.sender.send(ch, attempt.cartSnapshot, {
        templateId: stage.templateId,
        couponCode,
      });
      results.push({
        channel: ch,
        outcome: r.ok ? 'sent' : 'failed',
        at: this.now(),
        reason: r.reason,
      });
    }
    if (couponCode) {
      await this.claims.insert({
        tenantId: attempt.tenantId,
        customerId: attempt.customerId,
        attemptId: attempt.id,
        couponCode,
        at: this.now(),
      });
    }
    const anySent = results.some((r) => r.outcome === 'sent');
    const updated: RecoveryAttempt = {
      ...attempt,
      status: anySent ? 'sent' : 'failed',
      results,
      updatedAt: this.now(),
    };
    await this.attempts.update(updated);
    return updated;
  }

  /** 上游通知：客戶開了信 / 點了連結 / 完成下單 → 寫進指標。 */
  async recordOutcome(attemptId: string, channel: RecoveryChannel, outcome: SendOutcome, reason?: string): Promise<RecoveryAttempt> {
    const a = await this.attempts.findById(attemptId);
    if (!a) throw new Error(`找不到 attempt：${attemptId}`);
    const updated: RecoveryAttempt = {
      ...a,
      results: [...a.results, { channel, outcome, at: this.now(), reason }],
      updatedAt: this.now(),
    };
    await this.attempts.update(updated);
    return updated;
  }

  /** 漏斗指標：scheduled → sent → opened → clicked → converted。 */
  async funnelStats(tenantId: string): Promise<RecoveryFunnelStats> {
    const all = await this.attempts.listByTenant(tenantId);
    let sent = 0;
    let opened = 0;
    let clicked = 0;
    let converted = 0;
    let recoveredRevenueMinor = 0;
    for (const a of all) {
      const outcomes = new Set(a.results.map((r) => r.outcome));
      if (outcomes.has('sent') || outcomes.has('opened') || outcomes.has('clicked') || outcomes.has('converted')) sent++;
      if (outcomes.has('opened') || outcomes.has('clicked') || outcomes.has('converted')) opened++;
      if (outcomes.has('clicked') || outcomes.has('converted')) clicked++;
      if (outcomes.has('converted')) {
        converted++;
        recoveredRevenueMinor += a.cartSnapshot.totalMinor;
      }
    }
    return {
      scheduled: all.length,
      sent,
      opened,
      clicked,
      converted,
      clickRate: sent === 0 ? 0 : clicked / sent,
      conversionRate: sent === 0 ? 0 : converted / sent,
      recoveredRevenueMinor,
    };
  }
}

/** 標準 3 段棄單流程（1h Email、24h Email + 5% 折扣、72h Email + 10% 折扣 + LINE）。 */
export const DEFAULT_RECOVERY_FLOW: RecoveryFlowConfig = {
  abandonAfterMs: 30 * 60 * 1000,
  stages: [
    {
      delayMs: 60 * 60 * 1000,
      channels: ['email'],
      templateId: 'cart-abandoned-1',
    },
    {
      delayMs: 24 * 60 * 60 * 1000,
      channels: ['email'],
      templateId: 'cart-abandoned-2',
      couponCode: 'COMEBACK5',
    },
    {
      delayMs: 72 * 60 * 60 * 1000,
      channels: ['email', 'line'],
      templateId: 'cart-abandoned-3',
      couponCode: 'COMEBACK10',
    },
  ],
  maxDiscountPerCustomerPerMonth: 1,
};
