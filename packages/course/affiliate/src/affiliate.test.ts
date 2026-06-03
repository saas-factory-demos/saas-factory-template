import { describe, expect, it } from 'vitest';

import { InMemoryAffiliateStore } from './in-memory-store.js';
import { AffiliateService } from './service.js';

import type { CommissionPolicy } from './types.js';

const TENANT = 't1';
const COURSE = 'c1';
const INSTRUCTOR = 'inst-1';

function policy(over: Partial<CommissionPolicy> = {}): CommissionPolicy {
  return {
    id: 'pol-1',
    tenantId: TENANT,
    scope: 'tenant',
    platformRate: 0.3,
    instructorRate: 0.6,
    affiliateL1Rate: 0.1,
    affiliateL2Rate: 0,
    holdDays: 14,
    ...over,
  };
}

async function setup(p: CommissionPolicy = policy()) {
  const store = new InMemoryAffiliateStore();
  const svc = new AffiliateService(store);
  await svc.upsertPolicy(p);
  return { store, svc };
}

describe('AffiliateService.recordOrderSplit', () => {
  it('無 affiliate → 拆成 platform + instructor', async () => {
    const { svc } = await setup();
    const entries = await svc.recordOrderSplit({
      tenantId: TENANT, orderId: 'o1', courseId: COURSE, instructorId: INSTRUCTOR,
      amountMinor: 100000, orderedAt: new Date('2026-05-01'),
    });
    expect(entries).toHaveLength(2);
    const platform = entries.find((e) => e.payeeRole === 'platform');
    const instructor = entries.find((e) => e.payeeRole === 'instructor');
    expect(platform?.amountMinor).toBe(30000);
    // last entry gets remainder
    expect(instructor?.amountMinor).toBe(70000);
    expect(entries[0]?.status).toBe('held');
  });

  it('帶 refCode → 加入 L1', async () => {
    const { svc } = await setup();
    const aff = await svc.registerAffiliate({
      tenantId: TENANT, userId: 'aff-user', code: 'PROMO1',
    });
    const entries = await svc.recordOrderSplit({
      tenantId: TENANT, orderId: 'o2', courseId: COURSE, instructorId: INSTRUCTOR,
      amountMinor: 100000, refCode: 'PROMO1', orderedAt: new Date('2026-05-01'),
    });
    const l1 = entries.find((e) => e.payeeRole === 'affiliate-l1');
    expect(l1?.payeeId).toBe(aff.id);
    expect(l1?.amountMinor).toBeGreaterThan(0);
    expect(entries.reduce((s, e) => s + e.amountMinor, 0)).toBe(100000);
  });

  it('多層：L1 有 referredBy → L2 也拿到（policy L2 > 0 時）', async () => {
    const { svc } = await setup(policy({ platformRate: 0.3, instructorRate: 0.5, affiliateL1Rate: 0.15, affiliateL2Rate: 0.05 }));
    const l2 = await svc.registerAffiliate({ tenantId: TENANT, userId: 'u2', code: 'UP' });
    const l1 = await svc.registerAffiliate({
      tenantId: TENANT, userId: 'u1', code: 'DOWN', referredByCode: 'UP',
    });
    const entries = await svc.recordOrderSplit({
      tenantId: TENANT, orderId: 'o3', courseId: COURSE, instructorId: INSTRUCTOR,
      amountMinor: 100000, refCode: 'DOWN', orderedAt: new Date('2026-05-01'),
    });
    expect(entries.find((e) => e.payeeRole === 'affiliate-l1')?.payeeId).toBe(l1.id);
    expect(entries.find((e) => e.payeeRole === 'affiliate-l2')?.payeeId).toBe(l2.id);
  });

  it('分潤總和 > 100% → throw', async () => {
    const { svc } = await setup(policy({ platformRate: 0.5, instructorRate: 0.6, affiliateL1Rate: 0.2 }));
    await expect(
      svc.recordOrderSplit({
        tenantId: TENANT, orderId: 'oX', courseId: COURSE, instructorId: INSTRUCTOR,
        amountMinor: 1000, orderedAt: new Date(),
      }),
    ).rejects.toThrow(/超過 100/);
  });
});

describe('AffiliateService.settleHold (14 天)', () => {
  it('hold 期內不釋放，過了釋放為 available', async () => {
    const { svc } = await setup();
    const orderedAt = new Date('2026-05-01T00:00:00Z');
    await svc.recordOrderSplit({
      tenantId: TENANT, orderId: 'o1', courseId: COURSE, instructorId: INSTRUCTOR,
      amountMinor: 100000, orderedAt,
    });
    const day7 = new Date('2026-05-08T00:00:00Z');
    expect(await svc.settleHold(INSTRUCTOR, day7)).toBe(0);
    const day15 = new Date('2026-05-16T00:00:00Z');
    expect(await svc.settleHold(INSTRUCTOR, day15)).toBe(1);
    const balance = await svc.getPayeeBalance(INSTRUCTOR);
    expect(balance.availableMinor).toBe(70000);
    expect(balance.heldMinor).toBe(0);
  });
});

describe('AffiliateService.reverseOrder', () => {
  it('退款 → 整單 ledger 變 reversed', async () => {
    const { svc } = await setup();
    await svc.recordOrderSplit({
      tenantId: TENANT, orderId: 'o1', courseId: COURSE, instructorId: INSTRUCTOR,
      amountMinor: 100000, orderedAt: new Date('2026-05-01'),
    });
    await svc.reverseOrder('o1');
    const bal = await svc.getPayeeBalance(INSTRUCTOR);
    expect(bal.heldMinor).toBe(0);
    expect(bal.availableMinor).toBe(0);
  });
});

describe('AffiliateService.generateMonthlyPayout', () => {
  it('只算 available 且 releasesAt 落在該月', async () => {
    const { svc } = await setup();
    await svc.recordOrderSplit({
      tenantId: TENANT, orderId: 'o-may', courseId: COURSE, instructorId: INSTRUCTOR,
      amountMinor: 100000, orderedAt: new Date('2026-05-01T00:00:00Z'),
    });
    // 釋放點 = 2026-05-15
    await svc.settleHold(INSTRUCTOR, new Date('2026-06-01T00:00:00Z'));
    const summary = await svc.generateMonthlyPayout(TENANT, INSTRUCTOR, 'instructor', 2026, 5);
    expect(summary.month).toBe('2026-05');
    expect(summary.amountMinor).toBe(70000);
    const juneEmpty = await svc.generateMonthlyPayout(TENANT, INSTRUCTOR, 'instructor', 2026, 6);
    expect(juneEmpty.amountMinor).toBe(0);
  });
});
