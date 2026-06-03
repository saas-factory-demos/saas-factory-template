import { describe, expect, it, vi } from 'vitest';

import { InMemoryMemberTierStore } from './in-memory-store.js';
import { MemberTierService } from './service.js';

import type { MemberTier } from './types.js';

function makeTier(overrides: Partial<MemberTier>): MemberTier {
  return {
    id: overrides.id ?? 't1',
    tenantId: 'tenant-1',
    name: overrides.name ?? '銅',
    rank: overrides.rank ?? 1,
    conditions: overrides.conditions ?? [],
    discountPercentage: overrides.discountPercentage,
    pointsMultiplier: overrides.pointsMultiplier,
    freeShippingThreshold: overrides.freeShippingThreshold,
    notifyOnChange: overrides.notifyOnChange ?? true,
    active: overrides.active ?? true,
  };
}

describe('MemberTierService', () => {
  it('依累計消費評估為對應等級', async () => {
    const store = new InMemoryMemberTierStore();
    store.setTiers([
      makeTier({ id: 'bronze', name: '銅', rank: 1, conditions: [{ type: 'total_spend', amount: 0 }] }),
      makeTier({ id: 'silver', name: '銀', rank: 2, conditions: [{ type: 'total_spend', amount: 10000 }] }),
      makeTier({ id: 'gold', name: '金', rank: 3, conditions: [{ type: 'total_spend', amount: 50000 }] }),
    ]);
    const emit = vi.fn();
    const service = new MemberTierService(store, { emit });
    const result = await service.evaluate({
      userId: 'u1',
      tenantId: 'tenant-1',
      totalSpend: 60000,
      orderCount: 5,
    });
    expect(result.resolvedTierId).toBe('gold');
    expect(result.changed).toBe(true);
    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'member.tier-changed' }),
    );
  });

  it('降級觸發 downgrade 原因', async () => {
    const store = new InMemoryMemberTierStore();
    store.setTiers([
      makeTier({ id: 'bronze', rank: 1, conditions: [] }),
      makeTier({ id: 'gold', rank: 3, conditions: [{ type: 'total_spend', amount: 50000 }] }),
    ]);
    await store.saveStatus({
      userId: 'u1',
      tenantId: 'tenant-1',
      tierId: 'gold',
      enteredAt: '2025-01-01T00:00:00Z',
      nextReviewAt: '2026-01-01T00:00:00Z',
      totalSpend: 50000,
      orderCount: 10,
    });
    const service = new MemberTierService(store);
    const result = await service.evaluate({
      userId: 'u1',
      tenantId: 'tenant-1',
      totalSpend: 0,
      orderCount: 0,
    });
    expect(result.resolvedTierId).toBe('bronze');
    expect(result.reason).toBe('downgrade');
  });

  it('等級不變不會 emit', async () => {
    const store = new InMemoryMemberTierStore();
    store.setTiers([
      makeTier({ id: 'bronze', rank: 1, conditions: [{ type: 'total_spend', amount: 0 }] }),
    ]);
    await store.saveStatus({
      userId: 'u1',
      tenantId: 'tenant-1',
      tierId: 'bronze',
      enteredAt: '2025-01-01T00:00:00Z',
      nextReviewAt: '2026-01-01T00:00:00Z',
      totalSpend: 1000,
      orderCount: 1,
    });
    const emit = vi.fn();
    const service = new MemberTierService(store, { emit });
    const result = await service.evaluate({
      userId: 'u1',
      tenantId: 'tenant-1',
      totalSpend: 2000,
      orderCount: 2,
    });
    expect(result.changed).toBe(false);
    expect(emit).not.toHaveBeenCalled();
  });

  it('getCurrentTier 回傳設定', async () => {
    const store = new InMemoryMemberTierStore();
    const tier = makeTier({ id: 'silver', discountPercentage: 5 });
    store.setTiers([tier]);
    await store.saveStatus({
      userId: 'u1',
      tenantId: 'tenant-1',
      tierId: 'silver',
      enteredAt: '2025-01-01T00:00:00Z',
      nextReviewAt: '2026-01-01T00:00:00Z',
      totalSpend: 0,
      orderCount: 0,
    });
    const service = new MemberTierService(store);
    const current = await service.getCurrentTier('u1', 'tenant-1');
    expect(current?.id).toBe('silver');
  });
});
