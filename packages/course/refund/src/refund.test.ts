import { describe, expect, it, vi } from 'vitest';

import { InMemoryRefundStore } from './in-memory-store.js';
import { RefundService } from './service.js';

import type { IssueAllowanceHook, ProgressHydrator, RefundPolicy } from './types.js';

const TENANT = 't1';
const COURSE = 'c1';

function policy(over: Partial<RefundPolicy> = {}): RefundPolicy {
  return {
    id: 'p1',
    tenantId: TENANT,
    scope: 'tenant',
    coolingOffDays: 7,
    maxWatchedRatioForFullRefund: 0.3,
    allowProRataAfterCoolingOff: true,
    proRataBasis: 'remaining-lessons',
    ...over,
  };
}

async function setup(p: RefundPolicy = policy()) {
  const store = new InMemoryRefundStore();
  const allowance = vi.fn(async (_i: { orderId: string; refundAmountMinor: number; reason: string }) => ({
    allowanceId: 'allow-1',
  })) as unknown as IssueAllowanceHook;
  const svc = new RefundService(store, allowance);
  await svc.upsertPolicy(p);
  return { store, svc, allowance: allowance as unknown as ReturnType<typeof vi.fn> };
}

const paidAt = new Date('2026-05-01T00:00:00Z');

describe('RefundService.checkEligibility', () => {
  it('鑑賞期內、觀看 < 30% → 全額退', async () => {
    const { svc } = await setup();
    const r = await svc.checkEligibility({
      tenantId: TENANT, courseId: COURSE, orderId: 'o1',
      amountMinor: 100000, paidAt, watchedRatio: 0.1,
      now: new Date('2026-05-05T00:00:00Z'),
    });
    expect(r.mode).toBe('full');
    expect(r.refundableMinor).toBe(100000);
  });

  it('鑑賞期內、觀看 >= 30% → 不可退', async () => {
    const { svc } = await setup();
    const r = await svc.checkEligibility({
      tenantId: TENANT, courseId: COURSE, orderId: 'o1',
      amountMinor: 100000, paidAt, watchedRatio: 0.5,
      now: new Date('2026-05-05T00:00:00Z'),
    });
    expect(r.eligible).toBe(false);
    expect(r.reason).toContain('30%');
  });

  it('過鑑賞期、按未完成單元比例退', async () => {
    const { svc } = await setup();
    const r = await svc.checkEligibility({
      tenantId: TENANT, courseId: COURSE, orderId: 'o1',
      amountMinor: 100000, paidAt, watchedRatio: 0.4,
      completedLessons: 3, totalLessons: 10,
      now: new Date('2026-05-15T00:00:00Z'),
    });
    expect(r.mode).toBe('pro-rata');
    expect(r.refundableMinor).toBe(70000);
  });

  it('關閉 pro-rata → 過鑑賞期不退', async () => {
    const { svc } = await setup(policy({ allowProRataAfterCoolingOff: false }));
    const r = await svc.checkEligibility({
      tenantId: TENANT, courseId: COURSE, orderId: 'o1',
      amountMinor: 100000, paidAt, watchedRatio: 0.1,
      now: new Date('2026-05-15T00:00:00Z'),
    });
    expect(r.eligible).toBe(false);
    expect(r.reason).toContain('鑑賞期');
  });

  it('按剩餘天數退', async () => {
    const { svc } = await setup(policy({ proRataBasis: 'remaining-days', courseDurationDays: 100 }));
    const r = await svc.checkEligibility({
      tenantId: TENANT, courseId: COURSE, orderId: 'o1',
      amountMinor: 100000, paidAt, watchedRatio: 0.4,
      now: new Date('2026-05-21T00:00:00Z'),
    });
    // 20 / 100 已過 → 退 80%
    expect(r.refundableMinor).toBe(80000);
  });
});

describe('RefundService.createRequest / approve', () => {
  it('核准 → 呼叫 issueAllowance 並寫回 invoiceAllowanceId', async () => {
    const { svc, allowance } = await setup();
    const req = await svc.createRequest({
      tenantId: TENANT, orderId: 'o1', enrollmentId: 'e1', userId: 'u1', courseId: COURSE,
      amountMinor: 100000, paidAt, watchedRatio: 0.1, reason: 'cooling-off',
      now: new Date('2026-05-03'),
    });
    expect(req.refundableMinor).toBe(100000);
    expect(req.status).toBe('pending');
    const approved = await svc.approve(req.id);
    expect(allowance).toHaveBeenCalledOnce();
    expect(allowance.mock.calls[0]?.[0]).toMatchObject({
      orderId: 'o1', refundAmountMinor: 100000, reason: 'cooling-off',
    });
    expect(approved.status).toBe('approved');
    expect(approved.invoiceAllowanceId).toBe('allow-1');
  });

  it('createRequest 不符條件 → throw', async () => {
    const { svc } = await setup();
    await expect(
      svc.createRequest({
        tenantId: TENANT, orderId: 'o1', enrollmentId: 'e1', userId: 'u1', courseId: COURSE,
        amountMinor: 100000, paidAt, watchedRatio: 0.5, reason: 'cooling-off',
        now: new Date('2026-05-03'),
      }),
    ).rejects.toThrow(/不符合/);
  });

  it('approve → markRefunded', async () => {
    const { svc } = await setup();
    const req = await svc.createRequest({
      tenantId: TENANT, orderId: 'o1', enrollmentId: 'e1', userId: 'u1', courseId: COURSE,
      amountMinor: 100000, paidAt, watchedRatio: 0.1, reason: 'cooling-off',
      now: new Date('2026-05-03'),
    });
    await svc.approve(req.id);
    const done = await svc.markRefunded(req.id);
    expect(done.status).toBe('refunded');
  });

  it('createRequest 以 hydrateProgress 覆蓋偽造的 watchedRatio', async () => {
    const store = new InMemoryRefundStore();
    const allowance = vi.fn(async (_i: { orderId: string; refundAmountMinor: number; reason: string }) => ({
      allowanceId: 'allow-1',
    })) as unknown as IssueAllowanceHook;
    // 伺服端說使用者實際已看 80% → 鑑賞期內超過 30% → 不能退
    const hydrate: ProgressHydrator = vi.fn(async () => ({ watchedRatio: 0.8 }));
    const svc = new RefundService(store, allowance, hydrate);
    await svc.upsertPolicy(policy());
    await expect(
      svc.createRequest({
        tenantId: TENANT,
        orderId: 'o1',
        enrollmentId: 'e1',
        userId: 'u1',
        courseId: COURSE,
        amountMinor: 100000,
        paidAt,
        watchedRatio: 0.0, // client 偽造
        reason: 'cooling-off',
        now: new Date('2026-05-03'),
      }),
    ).rejects.toThrow(/不符合/);
    expect(hydrate).toHaveBeenCalledOnce();
  });

  it('reject 寫 rejectionReason', async () => {
    const { svc } = await setup();
    const req = await svc.createRequest({
      tenantId: TENANT, orderId: 'o1', enrollmentId: 'e1', userId: 'u1', courseId: COURSE,
      amountMinor: 100000, paidAt, watchedRatio: 0.1, reason: 'cooling-off',
      now: new Date('2026-05-03'),
    });
    const r = await svc.reject(req.id, '證據不足');
    expect(r.status).toBe('rejected');
    expect(r.rejectionReason).toBe('證據不足');
  });
});
