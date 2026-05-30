import { describe, expect, it } from 'vitest';

import {
  expandVariantMatrix,
  isScheduledForPublish,
  totalInventory,
  validateProductTitle,
  validateSlug,
  variantMatrixSize,
} from './validators.js';

import type { ProductVariant } from './types.js';

describe('validateProductTitle', () => {
  it('合法標題 → valid', () => {
    expect(validateProductTitle('iPhone 15 Pro 256GB').valid).toBe(true);
  });

  it('空標題 → invalid', () => {
    expect(validateProductTitle('').valid).toBe(false);
    expect(validateProductTitle('   ').valid).toBe(false);
  });

  it('超過 70 字 → invalid', () => {
    const long = 'a'.repeat(71);
    const result = validateProductTitle(long);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('過長');
  });
});

describe('validateSlug', () => {
  it('合法 slug', () => {
    expect(validateSlug('iphone-15-pro')).toBe(true);
    expect(validateSlug('product-001')).toBe(true);
  });

  it('不合法 slug', () => {
    expect(validateSlug('IPhone-15')).toBe(false);
    expect(validateSlug('iphone_15')).toBe(false);
    expect(validateSlug('-iphone')).toBe(false);
    expect(validateSlug('iphone-')).toBe(false);
  });
});

describe('variantMatrixSize', () => {
  it('2 規格 × 3 規格 = 6', () => {
    expect(variantMatrixSize({ color: ['紅', '藍'], size: ['S', 'M', 'L'] })).toBe(6);
  });

  it('空 options → 0', () => {
    expect(variantMatrixSize({})).toBe(0);
  });
});

describe('expandVariantMatrix', () => {
  it('展開所有組合', () => {
    const combos = expandVariantMatrix({ color: ['紅', '藍'], size: ['S', 'L'] });
    expect(combos).toHaveLength(4);
    expect(combos).toContainEqual({ color: '紅', size: 'S' });
    expect(combos).toContainEqual({ color: '藍', size: 'L' });
  });

  it('空 options → 空陣列', () => {
    expect(expandVariantMatrix({})).toEqual([]);
  });
});

describe('isScheduledForPublish', () => {
  it('draft + 未來時間 → true', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(isScheduledForPublish({ status: 'draft', scheduledAt: future })).toBe(true);
  });

  it('已上架 → false', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(isScheduledForPublish({ status: 'active', scheduledAt: future })).toBe(false);
  });

  it('過去時間 → false', () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    expect(isScheduledForPublish({ status: 'draft', scheduledAt: past })).toBe(false);
  });
});

describe('totalInventory', () => {
  it('多 variant 庫存加總', () => {
    const variants: ProductVariant[] = [
      { id: 'v1', productId: 'p', sku: 'A', optionValues: {}, price: 100, inventory: 10 },
      { id: 'v2', productId: 'p', sku: 'B', optionValues: {}, price: 100, inventory: 5 },
    ];
    expect(totalInventory(variants)).toBe(15);
  });
});
