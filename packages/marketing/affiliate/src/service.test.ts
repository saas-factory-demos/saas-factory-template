import { beforeEach, describe, expect, it } from 'vitest';

import {
  InMemoryAffiliateStore,
  InMemoryAttributionStore,
  InMemoryCommissionStore,
  InMemoryPayoutStore,
} from './in-memory-store.js';
import { AffiliateService } from './service.js';

import type { CommissionPolicy } from './types.js';

const DAY = 24 * 60 * 60 * 1000;

describe('AffiliateService', () => {
  let affiliates: InMemoryAffiliateStore;
  let attributions: InMemoryAttributionStore;
  let commissions: InMemoryCommissionStore;
  let payouts: InMemoryPayoutStore;
  let service: AffiliateService;
  let counter = 0;
  const now = new Date('2026-05-15T00:00:00Z');
  const policy: CommissionPolicy = {
    level1Rate: 0.1,
    level2Rate: 0.03,
    multiLevelEnabled: true,
    holdDays: 14,
    selfReferralWindowMinutes: 60,
  };

  beforeEach(() => {
    affiliates = new InMemoryAffiliateStore();
    attributions = new InMemoryAttributionStore();
    commissions = new InMemoryCommissionStore();
    payouts = new InMemoryPayoutStore();
    counter = 0;
    service = new AffiliateService(affiliates, attributions, commissions, payouts, policy, {
      now: () => now,
      genId: () => `id_${++counter}`,
    });
  });

  it('register 建立推薦人並阻擋重複 code', async () => {
    const a = await service.register({ tenantId: 't1', code: 'EPH123', customerId: 'c1' });
    expect(a.code).toBe('EPH123');
    expect(a.status).toBe('active');
    await expect(
      service.register({ tenantId: 't1', code: 'EPH123' }),
    ).rejects.toThrow('推薦碼已存在');
  });

  it('attributeOrder 建立 level1 commission（單層）', async () => {
    const a = await service.register({ tenantId: 't1', code: 'EPH', customerId: 'c1' });
    const { commissions: list } = await service.attributeOrder({
      tenantId: 't1',
      orderId: 'o1',
      code: 'EPH',
      orderAmountMinor: 10000,
      customerId: 'c2',
      at: now,
    });
    expect(list).toHaveLength(1);
    expect(list[0]?.affiliateId).toBe(a.id);
    expect(list[0]?.amountMinor).toBe(1000);
    expect(list[0]?.status).toBe('pending');
    expect(list[0]?.releaseAt.getTime()).toBe(now.getTime() + 14 * DAY);
  });

  it('attributeOrder 啟用多層分潤時也建立 level2', async () => {
    const parent = await service.register({ tenantId: 't1', code: 'PARENT' });
    await service.register({
      tenantId: 't1',
      code: 'CHILD',
      parentAffiliateId: parent.id,
    });
    const { commissions: list } = await service.attributeOrder({
      tenantId: 't1',
      orderId: 'o1',
      code: 'CHILD',
      orderAmountMinor: 10000,
      at: now,
    });
    expect(list).toHaveLength(2);
    expect(list.find((c) => c.level === 2)?.amountMinor).toBe(300);
    expect(list.find((c) => c.level === 2)?.affiliateId).toBe(parent.id);
  });

  it('attributeOrder 偵測自推自不發 commission', async () => {
    await service.register({ tenantId: 't1', code: 'EPH', customerId: 'c1' });
    const { commissions: list } = await service.attributeOrder({
      tenantId: 't1',
      orderId: 'o1',
      code: 'EPH',
      orderAmountMinor: 10000,
      customerId: 'c1',
      at: now,
    });
    expect(list).toHaveLength(0);
  });

  it('approveDueCommissions hold 期過後轉 approved', async () => {
    await service.register({ tenantId: 't1', code: 'EPH', customerId: 'c1' });
    await service.attributeOrder({
      tenantId: 't1',
      orderId: 'o1',
      code: 'EPH',
      orderAmountMinor: 10000,
      customerId: 'c2',
      at: now,
    });
    const later = new Date(now.getTime() + 15 * DAY);
    const approved = await service.approveDueCommissions('t1', later);
    expect(approved).toHaveLength(1);
    expect(approved[0]?.status).toBe('approved');
  });

  it('clawbackOrder 退款後 commission 轉 clawback', async () => {
    await service.register({ tenantId: 't1', code: 'EPH', customerId: 'c1' });
    await service.attributeOrder({
      tenantId: 't1',
      orderId: 'o1',
      code: 'EPH',
      orderAmountMinor: 10000,
      customerId: 'c2',
      at: now,
    });
    const cb = await service.clawbackOrder('o1');
    expect(cb[0]?.status).toBe('clawback');
  });

  it('clawbackOrder 跳過已結算到「已支付」payout 的 commission（避免雙重扣回）', async () => {
    const aff = await service.register({ tenantId: 't1', code: 'EPH', customerId: 'c1' });
    await service.attributeOrder({
      tenantId: 't1',
      orderId: 'o1',
      code: 'EPH',
      orderAmountMinor: 10000,
      customerId: 'c2',
      at: now,
    });
    await service.approveDueCommissions('t1', new Date(now.getTime() + 30 * DAY));
    const payout = await service.createMonthlyPayout({
      tenantId: 't1',
      affiliateId: aff.id,
      yearMonth: '2026-05',
    });
    await service.requestPayout(payout.id);
    await service.markPaid(payout.id);

    const cb = await service.clawbackOrder('o1');
    expect(cb).toHaveLength(0);
    const stored = await commissions.listByOrder('o1');
    expect(stored[0]?.status).toBe('approved');
  });

  it('clawbackOrder 仍可回扣已綁定 draft payout 的 commission（錢尚未匯出）', async () => {
    const aff = await service.register({ tenantId: 't1', code: 'EPH', customerId: 'c1' });
    await service.attributeOrder({
      tenantId: 't1',
      orderId: 'o1',
      code: 'EPH',
      orderAmountMinor: 10000,
      customerId: 'c2',
      at: now,
    });
    await service.approveDueCommissions('t1', new Date(now.getTime() + 30 * DAY));
    await service.createMonthlyPayout({
      tenantId: 't1',
      affiliateId: aff.id,
      yearMonth: '2026-05',
    });
    const cb = await service.clawbackOrder('o1');
    expect(cb[0]?.status).toBe('clawback');
  });

  it('月結流程：approve → createMonthlyPayout → request → markPaid', async () => {
    const aff = await service.register({ tenantId: 't1', code: 'EPH', customerId: 'c1' });
    await service.attributeOrder({
      tenantId: 't1',
      orderId: 'o1',
      code: 'EPH',
      orderAmountMinor: 10000,
      customerId: 'c2',
      at: now,
    });
    await service.approveDueCommissions('t1', new Date(now.getTime() + 30 * DAY));
    const payout = await service.createMonthlyPayout({
      tenantId: 't1',
      affiliateId: aff.id,
      yearMonth: '2026-05',
    });
    expect(payout.totalAmountMinor).toBe(1000);
    expect(payout.status).toBe('draft');
    const requested = await service.requestPayout(payout.id);
    expect(requested.status).toBe('requested');
    const paid = await service.markPaid(payout.id);
    expect(paid.status).toBe('paid');
    expect(paid.paidAt).toBeDefined();
  });

  it('getStats 回傳推薦人累計', async () => {
    const aff = await service.register({ tenantId: 't1', code: 'EPH', customerId: 'c1' });
    await service.attributeOrder({
      tenantId: 't1',
      orderId: 'o1',
      code: 'EPH',
      orderAmountMinor: 10000,
      customerId: 'c2',
      at: now,
    });
    await service.attributeOrder({
      tenantId: 't1',
      orderId: 'o2',
      code: 'EPH',
      orderAmountMinor: 5000,
      customerId: 'c3',
      at: now,
    });
    const stats = await service.getStats('t1', aff.id);
    expect(stats.totalOrders).toBe(2);
    expect(stats.totalRevenueMinor).toBe(15000);
    expect(stats.pendingCommissionMinor).toBe(1500);
  });
});
