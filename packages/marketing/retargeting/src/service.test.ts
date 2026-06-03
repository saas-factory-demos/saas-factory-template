import { beforeEach, describe, expect, it } from 'vitest';

import {
  InMemoryCustomerActivityStore,
  InMemoryCustomerLifecycleStore,
  InMemoryProductViewStore,
  InMemoryRetargetTaskStore,
} from './in-memory-store.js';
import { classifyLifecycle } from './lifecycle.js';
import { RetargetingService } from './service.js';

import type { CustomerActivity } from './types.js';

const DAY = 24 * 60 * 60 * 1000;

describe('classifyLifecycle', () => {
  const base = (over: Partial<CustomerActivity> = {}): CustomerActivity => ({
    tenantId: 't1',
    customerId: 'c1',
    totalOrders: 0,
    totalSpentMinor: 0,
    ...over,
  });
  const now = new Date('2026-05-15T00:00:00Z');

  it('never-purchased 當 totalOrders 為 0', () => {
    expect(classifyLifecycle(base(), now)).toBe('never-purchased');
  });

  it('new 當首購且 30 天內', () => {
    const a = base({
      totalOrders: 1,
      firstPurchaseAt: new Date(now.getTime() - 10 * DAY),
      lastPurchaseAt: new Date(now.getTime() - 10 * DAY),
    });
    expect(classifyLifecycle(a, now)).toBe('new');
  });

  it('active 當 90 天內有訂單', () => {
    const a = base({
      totalOrders: 5,
      firstPurchaseAt: new Date(now.getTime() - 200 * DAY),
      lastPurchaseAt: new Date(now.getTime() - 30 * DAY),
    });
    expect(classifyLifecycle(a, now)).toBe('active');
  });

  it('at-risk 當 90-180 天無訂單', () => {
    const a = base({
      totalOrders: 3,
      firstPurchaseAt: new Date(now.getTime() - 300 * DAY),
      lastPurchaseAt: new Date(now.getTime() - 120 * DAY),
    });
    expect(classifyLifecycle(a, now)).toBe('at-risk');
  });

  it('dormant 當 180-365 天無訂單', () => {
    const a = base({
      totalOrders: 3,
      firstPurchaseAt: new Date(now.getTime() - 400 * DAY),
      lastPurchaseAt: new Date(now.getTime() - 250 * DAY),
    });
    expect(classifyLifecycle(a, now)).toBe('dormant');
  });

  it('lost 當 365+ 天無訂單', () => {
    const a = base({
      totalOrders: 3,
      firstPurchaseAt: new Date(now.getTime() - 800 * DAY),
      lastPurchaseAt: new Date(now.getTime() - 400 * DAY),
    });
    expect(classifyLifecycle(a, now)).toBe('lost');
  });
});

describe('RetargetingService', () => {
  let activities: InMemoryCustomerActivityStore;
  let lifecycles: InMemoryCustomerLifecycleStore;
  let views: InMemoryProductViewStore;
  let tasks: InMemoryRetargetTaskStore;
  let service: RetargetingService;
  let counter = 0;
  const now = new Date('2026-05-15T00:00:00Z');

  beforeEach(() => {
    activities = new InMemoryCustomerActivityStore();
    lifecycles = new InMemoryCustomerLifecycleStore();
    views = new InMemoryProductViewStore();
    tasks = new InMemoryRetargetTaskStore();
    counter = 0;
    service = new RetargetingService(activities, lifecycles, views, tasks, {
      now: () => now,
      genId: () => `id_${++counter}`,
    });
  });

  it('recordPurchase 累加 activity 並排 cross-sell 任務', async () => {
    const { activity, task } = await service.recordPurchase({
      tenantId: 't1',
      customerId: 'c1',
      orderId: 'o1',
      amountMinor: 1000,
      at: now,
    });
    expect(activity.totalOrders).toBe(1);
    expect(activity.totalSpentMinor).toBe(1000);
    expect(task.action).toBe('purchased-cross-sell');
    expect(task.scheduledAt.getTime()).toBe(now.getTime() + 7 * DAY);

    const r2 = await service.recordPurchase({
      tenantId: 't1',
      customerId: 'c1',
      orderId: 'o2',
      amountMinor: 500,
      at: new Date(now.getTime() + DAY),
    });
    expect(r2.activity.totalOrders).toBe(2);
    expect(r2.activity.totalSpentMinor).toBe(1500);
    expect(r2.activity.firstPurchaseAt).toEqual(now);
  });

  it('recordView 寫 ProductView 並排 viewed-not-added 任務', async () => {
    const view = await service.recordView({
      tenantId: 't1',
      customerId: 'c1',
      productId: 'p1',
      at: now,
    });
    expect(view.productId).toBe('p1');
    const list = await tasks.listByCustomer('t1', 'c1');
    expect(list).toHaveLength(1);
    expect(list[0]?.action).toBe('viewed-not-added');
    expect(list[0]?.scheduledAt.getTime()).toBe(now.getTime() + 3 * DAY);
  });

  it('recordView 對同 (customer, product) 多次呼叫只排一個 pending 任務', async () => {
    await service.recordView({ tenantId: 't1', customerId: 'c1', productId: 'p1', at: now });
    await service.recordView({
      tenantId: 't1',
      customerId: 'c1',
      productId: 'p1',
      at: new Date(now.getTime() + 60 * 1000),
    });
    await service.recordView({
      tenantId: 't1',
      customerId: 'c1',
      productId: 'p1',
      at: new Date(now.getTime() + 2 * 60 * 1000),
    });
    const list = await tasks.listByCustomer('t1', 'c1');
    const pending = list.filter((t) => t.action === 'viewed-not-added' && t.status === 'pending');
    expect(pending).toHaveLength(1);
  });

  it('recordView 取消後再瀏覽會重新排任務（cancelled 不阻擋）', async () => {
    await service.recordView({ tenantId: 't1', customerId: 'c1', productId: 'p1', at: now });
    await service.cancelViewedTasks('t1', 'c1', 'p1');
    await service.recordView({
      tenantId: 't1',
      customerId: 'c1',
      productId: 'p1',
      at: new Date(now.getTime() + DAY),
    });
    const list = await tasks.listByCustomer('t1', 'c1');
    const pending = list.filter((t) => t.action === 'viewed-not-added' && t.status === 'pending');
    expect(pending).toHaveLength(1);
  });

  it('cancelViewedTasks 只取消對應商品的 pending 任務', async () => {
    await service.recordView({ tenantId: 't1', customerId: 'c1', productId: 'p1', at: now });
    await service.recordView({ tenantId: 't1', customerId: 'c1', productId: 'p2', at: now });
    const cancelled = await service.cancelViewedTasks('t1', 'c1', 'p1');
    expect(cancelled).toHaveLength(1);
    expect(cancelled[0]?.refId).toBe('p1');
    expect(cancelled[0]?.status).toBe('cancelled');

    // 第二次再呼叫不應重複取消
    const again = await service.cancelViewedTasks('t1', 'c1', 'p1');
    expect(again).toHaveLength(0);
  });

  it('evaluateLifecycleForTenant 變動階段時觸發 win-back-30d 任務', async () => {
    await activities.upsert({
      tenantId: 't1',
      customerId: 'c1',
      firstPurchaseAt: new Date(now.getTime() - 300 * DAY),
      lastPurchaseAt: new Date(now.getTime() - 120 * DAY),
      totalOrders: 3,
      totalSpentMinor: 3000,
    });
    const result = await service.evaluateLifecycleForTenant('t1');
    expect(result).toHaveLength(1);
    expect(result[0]?.stage).toBe('at-risk');

    const due = await service.listDueTasks('t1', now);
    expect(due.some((t) => t.action === 'win-back-30d')).toBe(true);
  });

  it('evaluateLifecycleForTenant dormant 觸發 win-back-90d', async () => {
    await activities.upsert({
      tenantId: 't1',
      customerId: 'c1',
      firstPurchaseAt: new Date(now.getTime() - 400 * DAY),
      lastPurchaseAt: new Date(now.getTime() - 250 * DAY),
      totalOrders: 3,
      totalSpentMinor: 3000,
    });
    await service.evaluateLifecycleForTenant('t1');
    const due = await service.listDueTasks('t1', now);
    expect(due.some((t) => t.action === 'win-back-90d')).toBe(true);
  });

  it('evaluateLifecycleForTenant 同階段不重複觸發任務', async () => {
    await activities.upsert({
      tenantId: 't1',
      customerId: 'c1',
      firstPurchaseAt: new Date(now.getTime() - 300 * DAY),
      lastPurchaseAt: new Date(now.getTime() - 120 * DAY),
      totalOrders: 3,
      totalSpentMinor: 3000,
    });
    await service.evaluateLifecycleForTenant('t1');
    await service.evaluateLifecycleForTenant('t1');
    const winBack = (await tasks.listByCustomer('t1', 'c1')).filter(
      (t) => t.action === 'win-back-30d',
    );
    expect(winBack).toHaveLength(1);
  });

  it('markTaskSent 更新狀態為 sent', async () => {
    const { task } = await service.recordPurchase({
      tenantId: 't1',
      customerId: 'c1',
      orderId: 'o1',
      amountMinor: 1000,
      at: now,
    });
    const updated = await service.markTaskSent(task.id);
    expect(updated.status).toBe('sent');
  });

  it('listCustomersByStage 過濾正確', async () => {
    await activities.upsert({
      tenantId: 't1',
      customerId: 'c1',
      firstPurchaseAt: new Date(now.getTime() - 10 * DAY),
      lastPurchaseAt: new Date(now.getTime() - 10 * DAY),
      totalOrders: 1,
      totalSpentMinor: 500,
    });
    await activities.upsert({
      tenantId: 't1',
      customerId: 'c2',
      firstPurchaseAt: new Date(now.getTime() - 300 * DAY),
      lastPurchaseAt: new Date(now.getTime() - 120 * DAY),
      totalOrders: 3,
      totalSpentMinor: 3000,
    });
    await service.evaluateLifecycleForTenant('t1');
    const newCustomers = await service.listCustomersByStage('t1', 'new');
    const atRiskCustomers = await service.listCustomersByStage('t1', 'at-risk');
    expect(newCustomers.map((c) => c.customerId)).toEqual(['c1']);
    expect(atRiskCustomers.map((c) => c.customerId)).toEqual(['c2']);
  });
});
