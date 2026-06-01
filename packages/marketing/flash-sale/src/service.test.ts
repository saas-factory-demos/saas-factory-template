import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryFlashSaleStore } from './in-memory-store.js';
import { FlashSaleService, resolveCurrentDiscount } from './service.js';

const DAY = 24 * 60 * 60 * 1000;

describe('resolveCurrentDiscount', () => {
  const base = { kind: 'percent', rate: 0.05 } as const;
  const tiers = [
    { minCount: 10, discount: { kind: 'percent', rate: 0.1 } as const },
    { minCount: 50, discount: { kind: 'percent', rate: 0.2 } as const },
  ];

  it('未達門檻用 base', () => {
    const r = resolveCurrentDiscount(base, tiers, 0);
    expect(r.current).toEqual(base);
    expect(r.next?.minCount).toBe(10);
  });

  it('達 tier1', () => {
    const r = resolveCurrentDiscount(base, tiers, 20);
    expect(r.current).toEqual(tiers[0]!.discount);
    expect(r.next?.minCount).toBe(50);
  });

  it('達最高 tier', () => {
    const r = resolveCurrentDiscount(base, tiers, 100);
    expect(r.current).toEqual(tiers[1]!.discount);
    expect(r.next).toBeUndefined();
  });
});

describe('FlashSaleService', () => {
  let store: InMemoryFlashSaleStore;
  let service: FlashSaleService;
  let counter = 0;
  const now = new Date('2026-05-15T00:00:00Z');

  beforeEach(() => {
    store = new InMemoryFlashSaleStore();
    counter = 0;
    service = new FlashSaleService(store, {
      now: () => now,
      genId: () => `id_${++counter}`,
    });
  });

  it('create 拒絕 end <= start', async () => {
    await expect(
      service.create({
        tenantId: 't1',
        name: 'bad',
        scope: { kind: 'all' },
        baseDiscount: { kind: 'percent', rate: 0.1 },
        tiers: [],
        startAt: now,
        endAt: now,
      }),
    ).rejects.toThrow();
  });

  it('tickStatus scheduled → active → ended', async () => {
    const start = new Date(now.getTime() - DAY);
    const end = new Date(now.getTime() + DAY);
    const sale = await service.create({
      tenantId: 't1',
      name: 'demo',
      scope: { kind: 'all' },
      baseDiscount: { kind: 'percent', rate: 0.1 },
      tiers: [],
      startAt: start,
      endAt: end,
    });
    const activated = await service.tickStatus('t1', now);
    expect(activated[0]?.id).toBe(sale.id);
    expect(activated[0]?.status).toBe('active');

    const ended = await service.tickStatus('t1', new Date(end.getTime() + 60_000));
    expect(ended[0]?.status).toBe('ended');
  });

  it('incrementAddToCart 累加並影響 countdown 折扣', async () => {
    const sale = await service.create({
      tenantId: 't1',
      name: 'tier',
      scope: { kind: 'all' },
      baseDiscount: { kind: 'percent', rate: 0.05 },
      tiers: [{ minCount: 5, discount: { kind: 'percent', rate: 0.3 } }],
      startAt: new Date(now.getTime() - DAY),
      endAt: new Date(now.getTime() + DAY),
    });
    await service.tickStatus('t1', now);
    for (let i = 0; i < 5; i++) await service.incrementAddToCart(sale.id);
    const state = await service.getCountdownState(sale.id);
    expect(state.currentDiscount).toEqual({ kind: 'percent', rate: 0.3 });
    expect(state.nextTier).toBeUndefined();
  });

  it('matchesScope 三種 scope', async () => {
    const sale = await service.create({
      tenantId: 't1',
      name: 'all',
      scope: { kind: 'all' },
      baseDiscount: { kind: 'percent', rate: 0.1 },
      tiers: [],
      startAt: now,
      endAt: new Date(now.getTime() + DAY),
    });
    expect(service.matchesScope(sale, 'pX', [])).toBe(true);

    const productSale = await service.create({
      tenantId: 't1',
      name: 'p',
      scope: { kind: 'products', productIds: ['p1'] },
      baseDiscount: { kind: 'percent', rate: 0.1 },
      tiers: [],
      startAt: now,
      endAt: new Date(now.getTime() + DAY),
    });
    expect(service.matchesScope(productSale, 'p1', [])).toBe(true);
    expect(service.matchesScope(productSale, 'p2', [])).toBe(false);

    const catSale = await service.create({
      tenantId: 't1',
      name: 'c',
      scope: { kind: 'categories', categoryIds: ['supplement'] },
      baseDiscount: { kind: 'percent', rate: 0.1 },
      tiers: [],
      startAt: now,
      endAt: new Date(now.getTime() + DAY),
    });
    expect(service.matchesScope(catSale, 'pX', ['supplement'])).toBe(true);
    expect(service.matchesScope(catSale, 'pX', ['cookware'])).toBe(false);
  });
});
