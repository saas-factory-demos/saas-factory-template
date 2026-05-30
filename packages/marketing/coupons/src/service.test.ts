import { beforeEach, describe, expect, it } from 'vitest';

import {
  InMemoryCouponBatchStore,
  InMemoryCouponCodeStore,
  InMemoryCouponRedemptionStore,
} from './in-memory-store.js';
import { computeDiscount, CouponService } from './service.js';

const DAY = 24 * 60 * 60 * 1000;

describe('computeDiscount', () => {
  it('percent', () => {
    expect(computeDiscount({ kind: 'percent', rate: 0.1 }, 10000, 100)).toBe(1000);
  });
  it('fixed clamp', () => {
    expect(computeDiscount({ kind: 'fixed', amountMinor: 5000 }, 3000, 100)).toBe(3000);
  });
  it('free-shipping', () => {
    expect(computeDiscount({ kind: 'free-shipping' }, 10000, 200)).toBe(200);
  });
});

describe('CouponService', () => {
  let batches: InMemoryCouponBatchStore;
  let codes: InMemoryCouponCodeStore;
  let reds: InMemoryCouponRedemptionStore;
  let service: CouponService;
  let counter = 0;
  const now = new Date('2026-05-15T00:00:00Z');

  beforeEach(() => {
    batches = new InMemoryCouponBatchStore();
    codes = new InMemoryCouponCodeStore();
    reds = new InMemoryCouponRedemptionStore();
    counter = 0;
    service = new CouponService(batches, codes, reds, {
      now: () => now,
      genId: () => `id_${++counter}`,
      genCode: () => `C${++counter}`,
    });
  });

  it('createBatch + generateCodes 批量產 1000 張不重複', async () => {
    const b = await service.createBatch({
      tenantId: 't1',
      name: '5 月活動',
      discount: { kind: 'percent', rate: 0.1 },
      quantity: 1000,
      maxUsesPerCode: 1,
      validFrom: new Date(now.getTime() - DAY),
      validUntil: new Date(now.getTime() + 30 * DAY),
    });
    const list = await service.generateCodes(b.id, 1000);
    expect(list).toHaveLength(1000);
    const uniq = new Set(list.map((c) => c.code));
    expect(uniq.size).toBe(1000);
  });

  it('issuePersonalCode 限定客戶', async () => {
    const b = await service.createBatch({
      tenantId: 't1',
      name: '生日券',
      discount: { kind: 'fixed', amountMinor: 10000 },
      quantity: 1,
      maxUsesPerCode: 1,
      validFrom: new Date(now.getTime() - DAY),
      validUntil: new Date(now.getTime() + DAY),
    });
    const c = await service.issuePersonalCode({
      batchId: b.id,
      customerId: 'c1',
      source: 'auto-issue',
    });
    expect(c.assignedCustomerId).toBe('c1');
  });

  it('validate 拒絕：過期、未達門檻、非指定客戶', async () => {
    const b = await service.createBatch({
      tenantId: 't1',
      name: 'test',
      discount: { kind: 'percent', rate: 0.1 },
      quantity: 10,
      maxUsesPerCode: 1,
      minOrderAmountMinor: 50000,
      validFrom: new Date(now.getTime() - DAY),
      validUntil: new Date(now.getTime() + DAY),
    });
    await service.issuePersonalCode({
      batchId: b.id,
      customerId: 'cA',
      source: 'manual',
      code: 'ABC',
    });
    const wrongCustomer = await service.validate({
      tenantId: 't1',
      code: 'ABC',
      customerId: 'cB',
      orderAmountMinor: 100000,
      shippingMinor: 0,
      at: now,
    });
    expect(wrongCustomer.ok).toBe(false);
    if (!wrongCustomer.ok) expect(wrongCustomer.reason).toBe('not-assigned-customer');

    const minNotMet = await service.validate({
      tenantId: 't1',
      code: 'ABC',
      customerId: 'cA',
      orderAmountMinor: 10000,
      shippingMinor: 0,
      at: now,
    });
    expect(minNotMet.ok).toBe(false);
    if (!minNotMet.ok) expect(minNotMet.reason).toBe('min-order-not-met');

    const expired = await service.validate({
      tenantId: 't1',
      code: 'ABC',
      customerId: 'cA',
      orderAmountMinor: 100000,
      shippingMinor: 0,
      at: new Date(now.getTime() + 10 * DAY),
    });
    expect(expired.ok).toBe(false);
    if (!expired.ok) expect(expired.reason).toBe('after-valid-until');
  });

  it('redeem 寫入 usedCount + 同碼第二次 max-uses-reached', async () => {
    const b = await service.createBatch({
      tenantId: 't1',
      name: 'test',
      discount: { kind: 'percent', rate: 0.1 },
      quantity: 10,
      maxUsesPerCode: 1,
      validFrom: new Date(now.getTime() - DAY),
      validUntil: new Date(now.getTime() + DAY),
    });
    await service.issuePersonalCode({
      batchId: b.id,
      customerId: 'c1',
      source: 'manual',
      code: 'X',
    });
    const r = await service.redeem({
      tenantId: 't1',
      code: 'X',
      customerId: 'c1',
      orderId: 'o1',
      orderAmountMinor: 10000,
      shippingMinor: 0,
      at: now,
    });
    expect(r.discountAmountMinor).toBe(1000);
    await expect(
      service.redeem({
        tenantId: 't1',
        code: 'X',
        customerId: 'c1',
        orderId: 'o2',
        orderAmountMinor: 10000,
        shippingMinor: 0,
        at: now,
      }),
    ).rejects.toThrow('max-uses-reached');
  });

  it('statsForBatch 計算發出 / 使用 / 營收', async () => {
    const b = await service.createBatch({
      tenantId: 't1',
      name: 'test',
      discount: { kind: 'percent', rate: 0.1 },
      quantity: 5,
      maxUsesPerCode: 1,
      validFrom: new Date(now.getTime() - DAY),
      validUntil: new Date(now.getTime() + DAY),
    });
    await service.generateCodes(b.id, 5);
    const all = await codes.listByBatch(b.id);
    await service.redeem({
      tenantId: 't1',
      code: all[0]!.code,
      customerId: 'c1',
      orderId: 'o1',
      orderAmountMinor: 20000,
      shippingMinor: 0,
      at: now,
    });
    const stats = await service.statsForBatch(b.id);
    expect(stats.totalCodes).toBe(5);
    expect(stats.redeemedCount).toBe(1);
    expect(stats.totalDiscountMinor).toBe(2000);
    expect(stats.totalRevenueMinor).toBe(20000);
    expect(stats.conversionRate).toBeCloseTo(0.2);
  });

  it('listCodesExpiringSoon 抓快到期的個人碼', async () => {
    const b = await service.createBatch({
      tenantId: 't1',
      name: '快到期',
      discount: { kind: 'fixed', amountMinor: 5000 },
      quantity: 1,
      maxUsesPerCode: 1,
      validFrom: new Date(now.getTime() - DAY),
      validUntil: new Date(now.getTime() + 2 * DAY),
    });
    await service.issuePersonalCode({
      batchId: b.id,
      customerId: 'c1',
      source: 'auto-issue',
      code: 'SOON',
    });
    const list = await service.listCodesExpiringSoon('t1', 7);
    expect(list).toHaveLength(1);
    expect(list[0]?.code.code).toBe('SOON');
    await service.markNotified('t1', 'SOON');
    const again = await service.listCodesExpiringSoon('t1', 7);
    expect(again).toHaveLength(0);
  });
});
