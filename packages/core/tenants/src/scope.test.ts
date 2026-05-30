import { describe, expect, it } from 'vitest';

import { isGlobalCollection } from './global-collections.js';
import { canBypassTenant, getCurrentTenantId, tenantScoped } from './scope.js';

// 最小 mock：只放需要的欄位
type MockReq = {
  user?: { id?: string; role?: string; tenants?: string[] } | null;
  context?: Record<string, unknown>;
  headers: Headers;
};

function mockReq(init: Partial<MockReq> = {}): MockReq {
  return {
    user: init.user ?? null,
    context: init.context ?? {},
    headers: init.headers ?? new Headers(),
  };
}

describe('getCurrentTenantId', () => {
  it('context.tenantId 優先', () => {
    const req = mockReq({
      context: { tenantId: 'T-CTX' },
      user: { tenants: ['T-OTHER'] },
    });
    // @ts-expect-error mock 不符 PayloadRequest 但欄位夠用
    expect(getCurrentTenantId(req)).toBe('T-CTX');
  });

  it('沒 context 時讀 cookie currentTenantId', () => {
    const headers = new Headers({ cookie: 'currentTenantId=T-COOKIE; foo=bar' });
    const req = mockReq({ headers, user: { tenants: ['T-FALLBACK'] } });
    // @ts-expect-error mock
    expect(getCurrentTenantId(req)).toBe('T-COOKIE');
  });

  it('沒 context / cookie 時 fallback 到 user.tenants[0]', () => {
    const req = mockReq({ user: { tenants: ['T-USER-1', 'T-USER-2'] } });
    // @ts-expect-error mock
    expect(getCurrentTenantId(req)).toBe('T-USER-1');
  });

  it('全空回 null', () => {
    const req = mockReq();
    // @ts-expect-error mock
    expect(getCurrentTenantId(req)).toBeNull();
  });
});

describe('canBypassTenant', () => {
  it('owner + bypassTenant context 才放行', () => {
    const req = mockReq({
      user: { role: 'owner' },
      context: { bypassTenant: true },
    });
    // @ts-expect-error mock
    expect(canBypassTenant(req)).toBe(true);
  });

  it('admin 也不行', () => {
    const req = mockReq({
      user: { role: 'admin' },
      context: { bypassTenant: true },
    });
    // @ts-expect-error mock
    expect(canBypassTenant(req)).toBe(false);
  });

  it('owner 沒帶 bypassTenant flag 也不行', () => {
    const req = mockReq({ user: { role: 'owner' }, context: {} });
    // @ts-expect-error mock
    expect(canBypassTenant(req)).toBe(false);
  });
});

describe('tenantScoped', () => {
  const baseCollection = {
    slug: 'orders',
    fields: [{ name: 'total', type: 'number' as const }],
  };

  it('全域 collection 不套用', () => {
    const out = tenantScoped({ slug: 'audit-logs', fields: [] });
    expect(out).toEqual({ slug: 'audit-logs', fields: [] });
    expect(isGlobalCollection('audit-logs')).toBe(true);
  });

  it('套用後第一個欄位是 tenantId、required + indexed', () => {
    const out = tenantScoped(baseCollection);
    const first = out.fields[0];
    expect(first).toMatchObject({
      name: 'tenantId',
      type: 'text',
      required: true,
      index: true,
    });
  });

  it('套用後 access.read / update / delete 都換成 tenant-aware', () => {
    const out = tenantScoped(baseCollection);
    expect(typeof out.access?.read).toBe('function');
    expect(typeof out.access?.update).toBe('function');
    expect(typeof out.access?.delete).toBe('function');
  });

  it('tenant filter：未登入 user 一律拒絕', () => {
    const out = tenantScoped(baseCollection);
    const access = out.access?.read as (args: { req: MockReq }) => unknown;
    expect(access({ req: mockReq() })).toBe(false);
  });

  it('tenant filter：帶 tenant 的 user 拿到 where clause', () => {
    const out = tenantScoped(baseCollection);
    const access = out.access?.read as (args: { req: MockReq }) => unknown;
    const result = access({
      req: mockReq({
        user: { role: 'staff', tenants: ['T-A'] },
      }),
    });
    expect(result).toEqual({ tenantId: { equals: 'T-A' } });
  });

  it('tenant filter：owner + bypassTenant 拿到 true（全表）', () => {
    const out = tenantScoped(baseCollection);
    const access = out.access?.read as (args: { req: MockReq }) => unknown;
    const result = access({
      req: mockReq({
        user: { role: 'owner' },
        context: { bypassTenant: true },
      }),
    });
    expect(result).toBe(true);
  });
});
