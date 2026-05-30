import { describe, it, expect } from 'vitest';

import { DiscountEngine } from './engine.js';

import type { DiscountRule, DiscountContext } from './types.js';

function makeRule(overrides: Partial<DiscountRule>): DiscountRule {
  return {
    id: overrides.id ?? 'rule-1',
    tenantId: 'tenant-1',
    name: overrides.name ?? 'Test',
    type: overrides.type ?? 'percentage_off',
    params: overrides.params ?? {},
    conditions: overrides.conditions ?? [],
    stackable: overrides.stackable ?? true,
    priority: overrides.priority ?? 0,
    usedCount: overrides.usedCount ?? 0,
    active: overrides.active ?? true,
    ...overrides,
  };
}

function makeContext(overrides: Partial<DiscountContext> = {}): DiscountContext {
  return {
    items: overrides.items ?? [
      { variantId: 'v1', productId: 'p1', unitPrice: 1000, quantity: 1 },
    ],
    subtotal: overrides.subtotal ?? 1000,
    ...overrides,
  };
}

describe('DiscountEngine', () => {
  const engine = new DiscountEngine();

  it('百分比折扣計算', () => {
    const rules = [makeRule({ type: 'percentage_off', params: { percentage: 10 } })];
    const ctx = makeContext({ subtotal: 1000 });
    const results = engine.apply(rules, ctx);
    expect(results).toHaveLength(1);
    expect(results[0]!.amount).toBe(100);
  });

  it('固定金額折扣不能超過 subtotal', () => {
    const rules = [makeRule({ type: 'fixed_off', params: { amount: 2000 } })];
    const ctx = makeContext({ subtotal: 1000 });
    const results = engine.apply(rules, ctx);
    expect(results[0]!.amount).toBe(1000);
  });

  it('min_amount 條件未達不生效', () => {
    const rules = [
      makeRule({
        type: 'fixed_off',
        params: { amount: 100 },
        conditions: [{ type: 'min_amount', amount: 5000 }],
      }),
    ];
    const ctx = makeContext({ subtotal: 1000 });
    const results = engine.apply(rules, ctx);
    expect(results).toHaveLength(0);
  });

  it('stackable 規則全部生效', () => {
    const rules = [
      makeRule({ id: 'r1', type: 'percentage_off', params: { percentage: 10 }, stackable: true }),
      makeRule({ id: 'r2', type: 'fixed_off', params: { amount: 50 }, stackable: true }),
    ];
    const ctx = makeContext({ subtotal: 1000 });
    const results = engine.apply(rules, ctx);
    expect(results).toHaveLength(2);
  });

  it('non-stackable 只取最高', () => {
    const rules = [
      makeRule({ id: 'r1', type: 'fixed_off', params: { amount: 50 }, stackable: false, priority: 1 }),
      makeRule({ id: 'r2', type: 'fixed_off', params: { amount: 200 }, stackable: false, priority: 2 }),
    ];
    const ctx = makeContext({ subtotal: 1000 });
    const results = engine.apply(rules, ctx);
    expect(results).toHaveLength(1);
    expect(results[0]!.ruleId).toBe('r2');
    expect(results[0]!.amount).toBe(200);
  });

  it('免運產生 shippingDiscount', () => {
    const rules = [makeRule({ type: 'free_shipping', params: { shippingFee: 80 } })];
    const ctx = makeContext({ subtotal: 1000 });
    const results = engine.apply(rules, ctx);
    expect(results[0]!.amount).toBe(0);
    expect(results[0]!.shippingDiscount).toBe(80);
  });

  it('buy_x_get_y 計算贈品金額', () => {
    const rules = [
      makeRule({
        type: 'buy_x_get_y',
        params: { buyQuantity: 2, getQuantity: 1, targetVariantId: 'v1' },
      }),
    ];
    const ctx = makeContext({
      items: [{ variantId: 'v1', productId: 'p1', unitPrice: 100, quantity: 3 }],
      subtotal: 300,
    });
    const results = engine.apply(rules, ctx);
    expect(results[0]!.amount).toBe(100);
  });

  it('使用次數超限不生效', () => {
    const rules = [
      makeRule({ type: 'fixed_off', params: { amount: 50 }, maxUses: 10, usedCount: 10 }),
    ];
    const results = engine.apply(rules, makeContext());
    expect(results).toHaveLength(0);
  });

  it('日期區間外不生效', () => {
    const rules = [
      makeRule({
        type: 'fixed_off',
        params: { amount: 50 },
        startsAt: '2099-01-01T00:00:00Z',
      }),
    ];
    const results = engine.apply(rules, makeContext());
    expect(results).toHaveLength(0);
  });

  it('first_purchase 條件控制', () => {
    const rules = [
      makeRule({
        type: 'fixed_off',
        params: { amount: 100 },
        conditions: [{ type: 'first_purchase' }],
      }),
    ];
    const noFirst = engine.apply(rules, makeContext({ isFirstPurchase: false }));
    expect(noFirst).toHaveLength(0);
    const firstBuy = engine.apply(rules, makeContext({ isFirstPurchase: true }));
    expect(firstBuy).toHaveLength(1);
  });
});
