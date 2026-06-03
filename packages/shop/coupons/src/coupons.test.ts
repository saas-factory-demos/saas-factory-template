import { describe, it, expect } from 'vitest';

import { generateBulkCodes, generateCode } from './code-generator.js';
import { InMemoryCouponStore } from './in-memory-store.js';
import { CouponService } from './service.js';

import type { Coupon } from './types.js';

function makeCoupon(overrides: Partial<Coupon>): Coupon {
  return {
    id: overrides.id ?? 'cp-1',
    tenantId: 'tenant-1',
    name: overrides.name ?? '測試券',
    mode: overrides.mode ?? 'code',
    source: 'campaign',
    rule: {
      name: '券對應規則',
      type: 'fixed_off',
      params: { amount: 100 },
      conditions: [],
      stackable: false,
      priority: 1,
      usedCount: 0,
      active: true,
    },
    totalUsageCount: overrides.totalUsageCount ?? 0,
    active: overrides.active ?? true,
    ...overrides,
  };
}

describe('CouponService', () => {
  it('產生 bulk code 並可兌換一次', async () => {
    const store = new InMemoryCouponStore();
    const service = new CouponService(store);
    const coupon = makeCoupon({ id: 'cp-bulk', mode: 'bulk' });
    await store.saveCoupon(coupon);

    const codes = await service.generateBulk(coupon, { count: 5, length: 8 });
    expect(codes).toHaveLength(5);

    const first = codes[0]!;
    const result = await service.redeem(first.code, 'user-1');
    expect(result.ok).toBe(true);
    expect(result.rule?.id).toBe('cp-bulk');

    await service.markRedeemed(coupon, first, 'user-1', 'order-1');
    const again = await service.redeem(first.code, 'user-1');
    expect(again.ok).toBe(false);
    expect(again.reason).toBe('already_redeemed');
  });

  it('code 模式可重複領用直到 totalUsageLimit', async () => {
    const store = new InMemoryCouponStore();
    const service = new CouponService(store);
    const coupon = makeCoupon({
      id: 'cp-code',
      mode: 'code',
      code: 'SAVE100',
      totalUsageLimit: 2,
    });
    await store.saveCoupon(coupon);

    const r1 = await service.redeem('SAVE100');
    expect(r1.ok).toBe(true);
    await service.markRedeemed(coupon, undefined, 'user-1', 'order-1');

    const r2 = await service.redeem('SAVE100');
    expect(r2.ok).toBe(true);
    await service.markRedeemed(coupon, undefined, 'user-2', 'order-2');

    const r3 = await service.redeem('SAVE100');
    expect(r3.ok).toBe(false);
    expect(r3.reason).toBe('usage_limit_reached');
  });

  it('auto 券會列入 auto-apply rules', async () => {
    const store = new InMemoryCouponStore();
    const service = new CouponService(store);
    await store.saveCoupon(makeCoupon({ id: 'cp-auto', mode: 'auto' }));
    const rules = await service.getAutoApplyRules('tenant-1');
    expect(rules).toHaveLength(1);
    expect(rules[0]!.id).toBe('cp-auto');
  });

  it('找不到 code 回傳 not_found', async () => {
    const service = new CouponService(new InMemoryCouponStore());
    const r = await service.redeem('NOPE');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('not_found');
  });

  it('指定 assignedUserId 但他人兌換失敗', async () => {
    const store = new InMemoryCouponStore();
    const service = new CouponService(store);
    const coupon = makeCoupon({ id: 'cp-bulk-assign', mode: 'bulk' });
    await store.saveCoupon(coupon);
    const [codeRow] = await service.generateBulk(coupon, { count: 1, length: 8 });
    codeRow!.assignedUserId = 'user-A';
    await store.saveCouponCodes([codeRow!]);

    const wrong = await service.redeem(codeRow!.code, 'user-B');
    expect(wrong.ok).toBe(false);
    expect(wrong.reason).toBe('wrong_user');

    const right = await service.redeem(codeRow!.code, 'user-A');
    expect(right.ok).toBe(true);
  });

  it('code-generator 不重複', () => {
    const codes = generateBulkCodes({ count: 100, length: 8 });
    expect(new Set(codes).size).toBe(100);
  });

  it('code-generator 套用 prefix', () => {
    const codes = generateBulkCodes({ count: 3, length: 6, prefix: 'VIP' });
    for (const c of codes) expect(c.startsWith('VIP-')).toBe(true);
  });

  it('generateCode 長度正確', () => {
    expect(generateCode(12).length).toBe(12);
  });
});
