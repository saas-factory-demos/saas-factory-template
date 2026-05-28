import { randomBytes } from 'node:crypto';

import { classifyLifecycle } from './lifecycle.js';

import type {
  CustomerActivityStore,
  CustomerLifecycleStore,
  ProductViewStore,
  RetargetTaskStore,
} from './in-memory-store.js';
import type {
  CustomerActivity,
  CustomerLifecycle,
  LifecycleStage,
  ProductView,
  RetargetAction,
  RetargetTask,
} from './types.js';

const DAY = 24 * 60 * 60 * 1000;

/** Retargeting / lifecycle 服務。 */
export class RetargetingService {
  constructor(
    private readonly activities: CustomerActivityStore,
    private readonly lifecycles: CustomerLifecycleStore,
    private readonly views: ProductViewStore,
    private readonly tasks: RetargetTaskStore,
    private readonly options: { now?: () => Date; genId?: () => string } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(): string {
    return this.options.genId ? this.options.genId() : `rt_${randomBytes(5).toString('hex')}`;
  }

  /** 上游 order 成立時呼叫：更新活動 + 排 cross-sell 任務。 */
  async recordPurchase(input: { tenantId: string; customerId: string; orderId: string; amountMinor: number; at: Date }): Promise<{ activity: CustomerActivity; task: RetargetTask }> {
    const existing = await this.activities.get(input.tenantId, input.customerId);
    const activity: CustomerActivity = {
      tenantId: input.tenantId,
      customerId: input.customerId,
      firstPurchaseAt: existing?.firstPurchaseAt ?? input.at,
      lastPurchaseAt: input.at,
      totalOrders: (existing?.totalOrders ?? 0) + 1,
      totalSpentMinor: (existing?.totalSpentMinor ?? 0) + input.amountMinor,
    };
    await this.activities.upsert(activity);

    const task: RetargetTask = {
      id: this.genId(),
      tenantId: input.tenantId,
      customerId: input.customerId,
      action: 'purchased-cross-sell',
      refId: input.orderId,
      scheduledAt: new Date(input.at.getTime() + 7 * DAY),
      status: 'pending',
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    await this.tasks.insert(task);
    return { activity, task };
  }

  /** 上游 product.viewed 事件：記錄 + 若 72 小時內未加購，排 viewed-not-added 提醒。 */
  async recordView(input: { tenantId: string; customerId: string; productId: string; at: Date; source?: string }): Promise<ProductView> {
    const view: ProductView = {
      id: this.genId(),
      tenantId: input.tenantId,
      customerId: input.customerId,
      productId: input.productId,
      at: input.at,
      source: input.source,
    };
    await this.views.insert(view);

    // 去重：同 (customer, product) 已有 pending viewed-not-added 任務時不再排，避免使用者狂刷 PDP 排出 30 個任務
    const existing = await this.tasks.listByCustomer(input.tenantId, input.customerId);
    const dup = existing.find(
      (t) => t.action === 'viewed-not-added' && t.refId === input.productId && t.status === 'pending',
    );
    if (dup) return view;

    // 排程 3 天後寄「您看過的商品」（若客戶 3 天內加購則 cancelByCustomer 取消）
    const task: RetargetTask = {
      id: this.genId(),
      tenantId: input.tenantId,
      customerId: input.customerId,
      action: 'viewed-not-added',
      refId: input.productId,
      scheduledAt: new Date(input.at.getTime() + 3 * DAY),
      status: 'pending',
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    await this.tasks.insert(task);
    return view;
  }

  /** 客戶後續有加購行為時取消 viewed-not-added 任務。 */
  async cancelViewedTasks(tenantId: string, customerId: string, productId: string): Promise<RetargetTask[]> {
    const list = await this.tasks.listByCustomer(tenantId, customerId);
    const cancelled: RetargetTask[] = [];
    for (const t of list) {
      if (t.action === 'viewed-not-added' && t.refId === productId && t.status === 'pending') {
        const updated: RetargetTask = { ...t, status: 'cancelled', updatedAt: this.now() };
        await this.tasks.update(updated);
        cancelled.push(updated);
      }
    }
    return cancelled;
  }

  /** Cron：評估所有 tenant 客戶的 lifecycle 階段 + 偵測 transition 觸發喚回任務。 */
  async evaluateLifecycleForTenant(tenantId: string): Promise<CustomerLifecycle[]> {
    const all = await this.activities.listByTenant(tenantId);
    const now = this.now();
    const out: CustomerLifecycle[] = [];
    for (const a of all) {
      const stage = classifyLifecycle(a, now);
      const existing = await this.lifecycles.get(tenantId, a.customerId);
      if (existing?.stage === stage) {
        // 沒變動就只更新 evaluatedAt
        await this.lifecycles.upsert({ ...existing, evaluatedAt: now });
        out.push({ ...existing, evaluatedAt: now });
        continue;
      }
      const updated: CustomerLifecycle = {
        tenantId,
        customerId: a.customerId,
        stage,
        evaluatedAt: now,
        previousStage: existing?.stage,
      };
      await this.lifecycles.upsert(updated);
      await this.spawnTransitionTask(updated, a);
      out.push(updated);
    }
    return out;
  }

  /** 階段變動時觸發對應 task。 */
  private async spawnTransitionTask(l: CustomerLifecycle, _activity: CustomerActivity): Promise<void> {
    let action: RetargetAction | undefined;
    if (l.stage === 'at-risk') action = 'win-back-30d';
    else if (l.stage === 'dormant') action = 'win-back-90d';
    if (!action) return;

    const t: RetargetTask = {
      id: this.genId(),
      tenantId: l.tenantId,
      customerId: l.customerId,
      action,
      scheduledAt: this.now(),
      status: 'pending',
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    await this.tasks.insert(t);
  }

  /** Worker 拉到時的 due task。 */
  async listDueTasks(tenantId: string, now: Date = this.now()): Promise<RetargetTask[]> {
    return this.tasks.listDue(tenantId, now);
  }

  /** 標記任務已發送（外部 channel 走完後寫回）。 */
  async markTaskSent(taskId: string): Promise<RetargetTask> {
    const t = await this.tasks.findById(taskId);
    if (!t) throw new Error(`找不到 task：${taskId}`);
    const updated: RetargetTask = { ...t, status: 'sent', updatedAt: this.now() };
    await this.tasks.update(updated);
    return updated;
  }

  /** 查 lifecycle 群組（給 segments 模組接）。 */
  async listCustomersByStage(tenantId: string, stage: LifecycleStage): Promise<CustomerLifecycle[]> {
    return this.lifecycles.listByStage(tenantId, stage);
  }
}
