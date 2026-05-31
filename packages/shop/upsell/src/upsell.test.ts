import { describe, expect, it } from 'vitest';

import { InMemoryOfferStore } from './in-memory-store.js';
import { UpsellService } from './service.js';

import type { Offer } from './types.js';

function makeOffer(overrides: Partial<Offer>): Offer {
  return {
    id: overrides.id ?? 'off-1',
    tenantId: 'tenant-1',
    name: overrides.name ?? 'Test',
    placement: overrides.placement ?? 'order-bump',
    variantId: overrides.variantId ?? 'v-up',
    headline: overrides.headline ?? '升級',
    price: overrides.price ?? 200,
    triggers: overrides.triggers ?? [],
    priority: overrides.priority ?? 0,
    active: overrides.active ?? true,
    ...overrides,
  };
}

describe('UpsellService', () => {
  it('pickOffer 取 priority 最高', async () => {
    const store = new InMemoryOfferStore();
    const service = new UpsellService(store);
    await store.saveOffer(makeOffer({ id: 'a', priority: 1 }));
    await store.saveOffer(makeOffer({ id: 'b', priority: 5 }));
    const picked = await service.pickOffer('order-bump', {
      tenantId: 'tenant-1',
      cart: [],
      subtotal: 1000,
    });
    expect(picked?.id).toBe('b');
  });

  it('has_variant 觸發條件', async () => {
    const store = new InMemoryOfferStore();
    const service = new UpsellService(store);
    await store.saveOffer(
      makeOffer({
        id: 'cross',
        placement: 'cross-sell-pdp',
        triggers: [{ type: 'has_variant', variantId: 'v1' }],
      }),
    );
    const matched = await service.pickOffer('cross-sell-pdp', {
      tenantId: 'tenant-1',
      cart: [{ variantId: 'v1' }],
      subtotal: 100,
    });
    expect(matched?.id).toBe('cross');
    const noMatch = await service.pickOffer('cross-sell-pdp', {
      tenantId: 'tenant-1',
      cart: [{ variantId: 'other' }],
      subtotal: 100,
    });
    expect(noMatch).toBeNull();
  });

  it('OTO funnel 依 funnelStep 排序', async () => {
    const store = new InMemoryOfferStore();
    const service = new UpsellService(store);
    await store.saveOffer(makeOffer({ id: 'oto2', placement: 'oto', funnelStep: 2 }));
    await store.saveOffer(makeOffer({ id: 'oto1', placement: 'oto', funnelStep: 1 }));
    const funnel = await service.pickOtoFunnel({
      tenantId: 'tenant-1',
      cart: [],
      subtotal: 0,
    });
    expect(funnel.map((o) => o.id)).toEqual(['oto1', 'oto2']);
  });

  it('停用 / 過期 offer 不顯示', async () => {
    const store = new InMemoryOfferStore();
    const service = new UpsellService(store);
    await store.saveOffer(makeOffer({ id: 'off1', active: false }));
    await store.saveOffer(makeOffer({ id: 'off2', endsAt: '2020-01-01T00:00:00Z' }));
    const result = await service.pickOffer('order-bump', {
      tenantId: 'tenant-1',
      cart: [],
      subtotal: 0,
    });
    expect(result).toBeNull();
  });

  it('紀錄互動並計算 acceptance rate', async () => {
    const store = new InMemoryOfferStore();
    const service = new UpsellService(store);
    await service.recordShown({ tenantId: 'tenant-1', offerId: 'off1' });
    await service.recordShown({ tenantId: 'tenant-1', offerId: 'off1' });
    await service.recordAccepted({ tenantId: 'tenant-1', offerId: 'off1' });
    const stats = await service.getStats('off1');
    expect(stats.shown).toBe(2);
    expect(stats.accepted).toBe(1);
    expect(stats.acceptanceRate).toBe(0.5);
  });
});
