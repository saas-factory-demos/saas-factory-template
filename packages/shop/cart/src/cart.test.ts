import { describe, expect, it } from 'vitest';

import { InMemoryCartStore } from './in-memory-store.js';
import { CartService, calcFreeShippingProgress, calcSubtotal } from './service.js';

import type { ProductStatusChecker } from './types.js';

function svc(checker?: ProductStatusChecker): { cart: CartService; store: InMemoryCartStore } {
  const store = new InMemoryCartStore();
  return {
    store,
    cart: new CartService({ store, statusChecker: checker, now: () => 1000 }),
  };
}

describe('calcSubtotal', () => {
  it('小計加總', () => {
    expect(
      calcSubtotal([
        { variantId: 'a', productId: 'p', quantity: 2, unitPrice: 100, addedAt: 0 },
        { variantId: 'b', productId: 'p', quantity: 3, unitPrice: 50, addedAt: 0 },
      ]),
    ).toBe(350);
  });
});

describe('calcFreeShippingProgress', () => {
  it('未達門檻', () => {
    const r = calcFreeShippingProgress(700, { amount: 1000, currency: 'TWD' });
    expect(r.reached).toBe(false);
    expect(r.remaining).toBe(300);
    expect(r.progress).toBeCloseTo(0.7);
  });

  it('達門檻', () => {
    const r = calcFreeShippingProgress(1500, { amount: 1000, currency: 'TWD' });
    expect(r.reached).toBe(true);
    expect(r.remaining).toBe(0);
  });
});

describe('CartService.addItem', () => {
  it('新商品加入', async () => {
    const { cart } = svc();
    const c = await cart.getOrCreate({ tenantId: 't1', userId: null, sessionId: 's1' });
    const after = await cart.addItem(c.id, {
      variantId: 'v1',
      productId: 'p1',
      quantity: 2,
      unitPrice: 100,
    });
    expect(after.items).toHaveLength(1);
    expect(after.items[0]!.quantity).toBe(2);
  });

  it('重複加入累加數量', async () => {
    const { cart } = svc();
    const c = await cart.getOrCreate({ tenantId: 't1', userId: null, sessionId: 's1' });
    await cart.addItem(c.id, {
      variantId: 'v1',
      productId: 'p1',
      quantity: 2,
      unitPrice: 100,
    });
    const after = await cart.addItem(c.id, {
      variantId: 'v1',
      productId: 'p1',
      quantity: 3,
      unitPrice: 100,
    });
    expect(after.items[0]!.quantity).toBe(5);
  });
});

describe('CartService.setQuantity', () => {
  it('設為 0 → 移除', async () => {
    const { cart } = svc();
    const c = await cart.getOrCreate({ tenantId: 't1', userId: null, sessionId: 's1' });
    await cart.addItem(c.id, {
      variantId: 'v1',
      productId: 'p1',
      quantity: 2,
      unitPrice: 100,
    });
    const after = await cart.setQuantity(c.id, 'v1', 0);
    expect(after.items).toHaveLength(0);
  });
});

describe('CartService.merge', () => {
  it('登入後合併匿名購物車', async () => {
    const { cart, store } = svc();
    const anon = await cart.getOrCreate({
      tenantId: 't1',
      userId: null,
      sessionId: 's1',
    });
    await cart.addItem(anon.id, {
      variantId: 'v1',
      productId: 'p1',
      quantity: 1,
      unitPrice: 100,
    });
    const merged = await cart.merge({
      userId: 'u1',
      anonCartId: anon.id,
      tenantId: 't1',
    });
    expect(merged.userId).toBe('u1');
    expect(merged.items).toHaveLength(1);
    expect(await store.get(anon.id)).toBeNull();
  });
});

describe('CartService.validate', () => {
  it('庫存不足自動調整數量', async () => {
    const checker: ProductStatusChecker = {
      getAvailable: async (id) => (id === 'v1' ? 3 : 0),
    };
    const { cart } = svc(checker);
    const c = await cart.getOrCreate({ tenantId: 't1', userId: null, sessionId: 's1' });
    await cart.addItem(c.id, {
      variantId: 'v1',
      productId: 'p1',
      quantity: 10,
      unitPrice: 100,
    });
    await cart.addItem(c.id, {
      variantId: 'v2',
      productId: 'p2',
      quantity: 1,
      unitPrice: 100,
    });
    const r = await cart.validate(c.id);
    expect(r.removed).toEqual(['v2']);
    expect(r.adjusted).toEqual([{ variantId: 'v1', from: 10, to: 3 }]);
    expect(r.cart.items).toHaveLength(1);
    expect(r.cart.items[0]!.quantity).toBe(3);
  });
});
