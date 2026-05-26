import { describe, expect, it } from 'vitest';

import { markCustomizedAtBeforeChange } from './customized-at-hook';

const FROZEN = new Date('2026-05-20T12:00:00.000Z');
const frozenNow = (): Date => FROZEN;

describe('markCustomizedAtBeforeChange', () => {
  it('factory push update → 不寫 customizedAt', () => {
    const out = markCustomizedAtBeforeChange({
      data: { name: 'a', activeVersion: true },
      operation: 'update',
      fromFactoryPush: true,
      now: frozenNow,
    });
    expect(out?.customizedAt).toBeUndefined();
  });

  it('factory push create → 不寫 customizedAt', () => {
    const out = markCustomizedAtBeforeChange({
      data: { name: 'a' },
      operation: 'create',
      fromFactoryPush: true,
      now: frozenNow,
    });
    expect(out?.customizedAt).toBeUndefined();
  });

  it('後台 admin update → 寫入 customizedAt', () => {
    const out = markCustomizedAtBeforeChange({
      data: { name: 'a' },
      operation: 'update',
      fromFactoryPush: false,
      now: frozenNow,
    });
    expect(out?.customizedAt).toBe('2026-05-20T12:00:00.000Z');
  });

  it('後台 create → 不寫 customizedAt（新建不算 customize）', () => {
    const out = markCustomizedAtBeforeChange({
      data: { name: 'a' },
      operation: 'create',
      fromFactoryPush: false,
      now: frozenNow,
    });
    expect(out?.customizedAt).toBeUndefined();
  });

  it('data 為 undefined → 直接回 undefined', () => {
    const out = markCustomizedAtBeforeChange({
      data: undefined,
      operation: 'update',
      fromFactoryPush: false,
      now: frozenNow,
    });
    expect(out).toBeUndefined();
  });

  it('不覆蓋 data 其他欄位', () => {
    const out = markCustomizedAtBeforeChange({
      data: { name: 'x', status: 'active', nodes: [{ id: 't1' }] },
      operation: 'update',
      fromFactoryPush: false,
      now: frozenNow,
    });
    expect(out?.name).toBe('x');
    expect(out?.status).toBe('active');
    expect(out?.nodes).toEqual([{ id: 't1' }]);
  });
});
