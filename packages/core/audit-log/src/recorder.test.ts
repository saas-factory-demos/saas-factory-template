import { describe, expect, it } from 'vitest';

import { InMemoryAuditRecorder, _redactForTest } from './recorder.js';

describe('redact', () => {
  it('遮蔽敏感欄位', () => {
    const out = _redactForTest({
      email: 'a@b.com',
      password: 'hunter2',
      apiToken: 'tk_xxx',
    });
    expect(out).toEqual({
      email: 'a@b.com',
      password: '[REDACTED]',
      apiToken: '[REDACTED]',
    });
  });

  it('遞迴遮蔽巢狀欄位', () => {
    const out = _redactForTest({
      user: { email: 'a@b.com', password: 'x', nested: { secret: 's' } },
    });
    expect(out).toEqual({
      user: {
        email: 'a@b.com',
        password: '[REDACTED]',
        nested: { secret: '[REDACTED]' },
      },
    });
  });

  it('null / undefined 直接回原值', () => {
    expect(_redactForTest(null)).toBeNull();
    expect(_redactForTest(undefined)).toBeUndefined();
  });
});

describe('InMemoryAuditRecorder', () => {
  it('record 寫入 entries 並 redact', async () => {
    const r = new InMemoryAuditRecorder();
    await r.record({
      userId: 'U-1',
      tenantId: 'T-1',
      action: 'user.password.change',
      resourceType: 'User',
      resourceId: 'U-1',
      before: { password: 'old' },
      after: { password: 'new' },
    });

    expect(r.entries).toHaveLength(1);
    expect(r.entries[0]?.before).toEqual({ password: '[REDACTED]' });
    expect(r.entries[0]?.after).toEqual({ password: '[REDACTED]' });
    expect(r.entries[0]?.action).toBe('user.password.change');
  });

  it('crossTenant flag 保留', async () => {
    const r = new InMemoryAuditRecorder();
    await r.record({
      userId: 'U-owner',
      tenantId: null,
      action: 'order.read',
      resourceType: 'Order',
      resourceId: 'O-9',
      crossTenant: true,
    });
    expect(r.entries[0]?.crossTenant).toBe(true);
  });
});
