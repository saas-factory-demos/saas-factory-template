/**
 * 訂閱服務。
 */

import type {
  Subscription,
  SubscriptionFrequency,
  SubscriptionItem,
  SubscriptionStore,
} from './types.js';
import type { DomainEvent } from '@saas-factory/events';


export interface SubscriptionServiceConfig {
  emit?: (event: DomainEvent) => void;
  now?: () => Date;
  idGenerator?: () => string;
  /** 失敗重試上限（達到後狀態變 cancelled）。 */
  maxFailureRetries?: number;
}

/**
 * 訂閱服務：建立 / 自助操作 / cron 推進。
 *
 * 真實出貨由 cron 呼叫 `processDueRenewals(...)`，service 只負責狀態 + 排程，
 * 實際下單 / 扣款由 caller 注入 `executor` 串接 OrderService + payment-core。
 */
export class SubscriptionService {
  constructor(
    private readonly store: SubscriptionStore,
    private readonly config: SubscriptionServiceConfig = {},
  ) {}

  private now(): Date {
    return this.config.now?.() ?? new Date();
  }

  private genId(): string {
    return this.config.idGenerator?.() ?? `id-${this.now().getTime()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * 建立訂閱。
   */
  async create(input: {
    tenantId: string;
    userId: string;
    items: SubscriptionItem[];
    frequency: SubscriptionFrequency;
    shippingAddress: Subscription['shippingAddress'];
    paymentToken: string;
    cardExpiresAt: string;
    discountPercentage?: number;
  }): Promise<Subscription> {
    const at = this.now().toISOString();
    const sub: Subscription = {
      id: this.genId(),
      tenantId: input.tenantId,
      userId: input.userId,
      items: input.items,
      frequency: input.frequency,
      status: 'active',
      shippingAddress: input.shippingAddress,
      paymentToken: input.paymentToken,
      cardExpiresAt: input.cardExpiresAt,
      discountPercentage: input.discountPercentage,
      nextRunAt: this.computeNextRun(this.now(), input.frequency),
      failureCount: 0,
      createdAt: at,
      updatedAt: at,
    };
    await this.store.save(sub);
    this.config.emit?.({
      type: 'subscription.created',
      payload: {
        subscriptionId: sub.id,
        tenantId: sub.tenantId,
        userId: sub.userId,
      },
    });
    return sub;
  }

  /**
   * 暫停訂閱。
   */
  async pause(id: string, until?: Date): Promise<Subscription> {
    const sub = await this.requireSub(id);
    sub.status = 'paused';
    sub.pausedUntil = until?.toISOString();
    sub.updatedAt = this.now().toISOString();
    await this.store.save(sub);
    this.config.emit?.({
      type: 'subscription.paused',
      payload: {
        subscriptionId: sub.id,
        tenantId: sub.tenantId,
        userId: sub.userId,
        until: sub.pausedUntil,
      },
    });
    return sub;
  }

  /**
   * 恢復訂閱（從 paused 狀態）。
   */
  async resume(id: string): Promise<Subscription> {
    const sub = await this.requireSub(id);
    if (sub.status !== 'paused') throw new Error('訂閱非暫停狀態，無法恢復');
    sub.status = 'active';
    sub.pausedUntil = undefined;
    sub.nextRunAt = this.computeNextRun(this.now(), sub.frequency);
    sub.updatedAt = this.now().toISOString();
    await this.store.save(sub);
    this.config.emit?.({
      type: 'subscription.resumed',
      payload: { subscriptionId: sub.id, tenantId: sub.tenantId, userId: sub.userId },
    });
    return sub;
  }

  /**
   * 跳過下次出貨，將 nextRunAt 順延一個週期。
   */
  async skipNext(id: string): Promise<Subscription> {
    const sub = await this.requireSub(id);
    sub.nextRunAt = this.computeNextRun(new Date(sub.nextRunAt), sub.frequency);
    sub.updatedAt = this.now().toISOString();
    await this.store.save(sub);
    return sub;
  }

  /**
   * 變更頻率（重算下次出貨時間）。
   */
  async changeFrequency(id: string, frequency: SubscriptionFrequency): Promise<Subscription> {
    const sub = await this.requireSub(id);
    sub.frequency = frequency;
    sub.nextRunAt = this.computeNextRun(this.now(), frequency);
    sub.updatedAt = this.now().toISOString();
    await this.store.save(sub);
    return sub;
  }

  /**
   * 變更地址。
   */
  async changeAddress(id: string, address: Subscription['shippingAddress']): Promise<Subscription> {
    const sub = await this.requireSub(id);
    sub.shippingAddress = address;
    sub.updatedAt = this.now().toISOString();
    await this.store.save(sub);
    return sub;
  }

  /**
   * 取消訂閱。
   */
  async cancel(id: string, reason?: string): Promise<Subscription> {
    const sub = await this.requireSub(id);
    sub.status = 'cancelled';
    sub.updatedAt = this.now().toISOString();
    await this.store.save(sub);
    this.config.emit?.({
      type: 'subscription.cancelled',
      payload: { subscriptionId: sub.id, tenantId: sub.tenantId, userId: sub.userId, reason },
    });
    return sub;
  }

  /**
   * cron 入口：取出到期訂閱並交給 executor 處理。
   *
   * executor 可呼叫 OrderService + payment-core，並回傳是否成功。
   */
  async processDueRenewals(
    tenantId: string,
    executor: (sub: Subscription) => Promise<{ ok: boolean; orderId?: string; reason?: string }>,
  ): Promise<{ processed: number; succeeded: number; failed: number }> {
    const now = this.now();
    const due = await this.store.listDue(tenantId, now);
    let succeeded = 0;
    let failed = 0;
    for (const sub of due) {
      const result = await executor(sub);
      if (result.ok) {
        succeeded++;
        sub.failureCount = 0;
        sub.lastOrderId = result.orderId;
        sub.nextRunAt = this.computeNextRun(now, sub.frequency);
        sub.status = 'active';
      } else {
        failed++;
        sub.failureCount += 1;
        sub.status = 'past-due';
        const max = this.config.maxFailureRetries ?? 3;
        this.config.emit?.({
          type: 'subscription.renewal-failed',
          payload: {
            subscriptionId: sub.id,
            tenantId: sub.tenantId,
            userId: sub.userId,
            attempt: sub.failureCount,
            reason: result.reason,
          },
        });
        if (sub.failureCount >= max) {
          sub.status = 'cancelled';
          this.config.emit?.({
            type: 'subscription.cancelled',
            payload: {
              subscriptionId: sub.id,
              tenantId: sub.tenantId,
              userId: sub.userId,
              reason: '連續扣款失敗超過上限',
            },
          });
        } else {
          // 重試：下次 cron 再試（隔天）。
          sub.nextRunAt = new Date(now.getTime() + 86400000).toISOString();
        }
      }
      sub.updatedAt = now.toISOString();
      await this.store.save(sub);
      this.config.emit?.({
        type: 'subscription.renewal-scheduled',
        payload: {
          subscriptionId: sub.id,
          tenantId: sub.tenantId,
          userId: sub.userId,
          nextRunAt: sub.nextRunAt,
        },
      });
    }
    return { processed: due.length, succeeded, failed };
  }

  /**
   * 取出即將到期的卡片並 emit 提醒。
   */
  async notifyExpiringCards(tenantId: string, withinDays: number): Promise<number> {
    const subs = await this.store.listExpiringCards(tenantId, withinDays, this.now());
    for (const sub of subs) {
      this.config.emit?.({
        type: 'subscription.card-expiring',
        payload: {
          subscriptionId: sub.id,
          tenantId: sub.tenantId,
          userId: sub.userId,
          expiresAt: sub.cardExpiresAt,
        },
      });
    }
    return subs.length;
  }

  private async requireSub(id: string): Promise<Subscription> {
    const sub = await this.store.get(id);
    if (!sub) throw new Error('訂閱不存在');
    return sub;
  }

  /**
   * 計算下次扣款時間。
   *
   * 月 / 季使用真實月份算術（setMonth），避免「30 天一個月」造成每年漂移
   * 約 5 天，導致客戶被在錯誤的日曆日扣款。
   */
  private computeNextRun(from: Date, frequency: SubscriptionFrequency): string {
    if (frequency === 'weekly') {
      return new Date(from.getTime() + 7 * 86400000).toISOString();
    }
    if (frequency === 'biweekly') {
      return new Date(from.getTime() + 14 * 86400000).toISOString();
    }
    const next = new Date(from.getTime());
    const addMonths = frequency === 'monthly' ? 1 : 3;
    const day = next.getUTCDate();
    next.setUTCMonth(next.getUTCMonth() + addMonths);
    // 處理 1/31 + 1 月 = 3/3 的越界情形，回退到該月最後一天
    if (next.getUTCDate() !== day) {
      next.setUTCDate(0);
    }
    return next.toISOString();
  }
}
