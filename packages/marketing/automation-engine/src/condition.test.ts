import { describe, expect, it } from 'vitest';

import { evalCondition } from './condition.js';

describe('condition evaluator', () => {
  const ctx = { order: { totalMinor: 99000, tier: 'gold' }, items: ['a', 'b'] };

  it('eq / neq', () => {
    expect(evalCondition({ field: 'order.tier', op: 'eq', value: 'gold' }, ctx)).toBe(true);
    expect(evalCondition({ field: 'order.tier', op: 'neq', value: 'silver' }, ctx)).toBe(true);
  });

  it('gt / gte / lt / lte', () => {
    expect(evalCondition({ field: 'order.totalMinor', op: 'gt', value: 50000 }, ctx)).toBe(true);
    expect(evalCondition({ field: 'order.totalMinor', op: 'lte', value: 99000 }, ctx)).toBe(true);
    expect(evalCondition({ field: 'order.totalMinor', op: 'gt', value: 200000 }, ctx)).toBe(false);
  });

  it('in / not-in', () => {
    expect(evalCondition({ field: 'order.tier', op: 'in', value: ['gold', 'platinum'] }, ctx)).toBe(true);
    expect(evalCondition({ field: 'order.tier', op: 'not-in', value: ['silver'] }, ctx)).toBe(true);
  });

  it('exists / not-exists', () => {
    expect(evalCondition({ field: 'order.totalMinor', op: 'exists' }, ctx)).toBe(true);
    expect(evalCondition({ field: 'order.nonExistent', op: 'not-exists' }, ctx)).toBe(true);
  });

  it('all / any / not 組合', () => {
    expect(
      evalCondition(
        {
          all: [
            { field: 'order.tier', op: 'eq', value: 'gold' },
            { field: 'order.totalMinor', op: 'gt', value: 50000 },
          ],
        },
        ctx,
      ),
    ).toBe(true);

    expect(
      evalCondition(
        {
          any: [
            { field: 'order.tier', op: 'eq', value: 'silver' },
            { field: 'order.totalMinor', op: 'gt', value: 50000 },
          ],
        },
        ctx,
      ),
    ).toBe(true);

    expect(
      evalCondition({ not: { field: 'order.tier', op: 'eq', value: 'silver' } }, ctx),
    ).toBe(true);
  });
});
