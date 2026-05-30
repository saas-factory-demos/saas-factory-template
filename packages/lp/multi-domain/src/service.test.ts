import { describe, expect, it } from 'vitest';

import { InMemoryLpDomainBindingStore } from './in-memory-store.js';
import { LpMultiDomainService, type DnsTxtResolver } from './service.js';

function setup(dnsResolver?: DnsTxtResolver) {
  const store = new InMemoryLpDomainBindingStore();
  let n = 0;
  const svc = new LpMultiDomainService(store, {
    now: () => new Date('2026-05-15T10:00:00Z'),
    genId: () => `dom_${++n}`,
    genToken: () => `tok_${n}`,
    dnsResolver,
  });
  return { store, svc };
}

describe('LpMultiDomainService.addDomain', () => {
  it('正常繫結 + token 自動生成', async () => {
    const { svc } = setup();
    const b = await svc.addDomain({ tenantId: 't1', pageId: 'p1', domain: 'product-a.example.com' });
    expect(b.verificationStatus).toBe('pending');
    expect(b.verificationToken).toBeTruthy();
  });

  it('domain 大小寫 + scheme 自動 normalize', async () => {
    const { svc } = setup();
    const b = await svc.addDomain({
      tenantId: 't1',
      pageId: 'p1',
      domain: 'HTTPS://Product-B.example.com/',
    });
    expect(b.domain).toBe('product-b.example.com');
  });

  it('domain 重複 → throw', async () => {
    const { svc } = setup();
    await svc.addDomain({ tenantId: 't1', pageId: 'p1', domain: 'a.example.com' });
    await expect(
      svc.addDomain({ tenantId: 't1', pageId: 'p2', domain: 'A.EXAMPLE.COM' }),
    ).rejects.toThrow(/已被使用/);
  });

  it('無效 domain → throw', async () => {
    const { svc } = setup();
    await expect(
      svc.addDomain({ tenantId: 't1', pageId: 'p1', domain: 'not_a_domain' }),
    ).rejects.toThrow(/無效/);
  });
});

describe('LpMultiDomainService.verify', () => {
  it('DNS TXT 命中 token → verified', async () => {
    const { svc } = setup(async () => ['saas-factory-verify=other', 'tok_1']);
    const b = await svc.addDomain({ tenantId: 't1', pageId: 'p1', domain: 'a.example.com' });
    const result = await svc.verify(b.id);
    expect(result.verificationStatus).toBe('verified');
    expect(result.verifiedAt).toBeDefined();
  });

  it('TXT 不對 → failed', async () => {
    const { svc } = setup(async () => ['nope']);
    const b = await svc.addDomain({ tenantId: 't1', pageId: 'p1', domain: 'a.example.com' });
    const result = await svc.verify(b.id);
    expect(result.verificationStatus).toBe('failed');
  });

  it('沒注入 dnsResolver → throw', async () => {
    const { svc } = setup();
    const b = await svc.addDomain({ tenantId: 't1', pageId: 'p1', domain: 'a.example.com' });
    await expect(svc.verify(b.id)).rejects.toThrow(/dnsResolver/);
  });
});

describe('LpMultiDomainService.resolveDomain', () => {
  it('verified 才回路由', async () => {
    const { svc } = setup(async () => ['tok_1']);
    const b = await svc.addDomain({ tenantId: 't1', pageId: 'p1', domain: 'a.example.com' });
    expect(await svc.resolveDomain('a.example.com')).toBeUndefined();
    await svc.verify(b.id);
    const r = await svc.resolveDomain('A.example.COM');
    expect(r?.pageId).toBe('p1');
  });
});

describe('LpMultiDomainService primary', () => {
  it('同 page 只能一個 primary', async () => {
    const { svc } = setup();
    const a = await svc.addDomain({
      tenantId: 't1',
      pageId: 'p1',
      domain: 'a.example.com',
      isPrimary: true,
    });
    const b = await svc.addDomain({ tenantId: 't1', pageId: 'p1', domain: 'b.example.com' });
    await svc.setPrimary(b.id);
    const primary = await svc.getPrimary('t1', 'p1');
    expect(primary?.id).toBe(b.id);
    // a 不再是 primary
    const all = await svc.listByTenant('t1');
    const aReloaded = all.find((x) => x.id === a.id);
    expect(aReloaded?.isPrimary).toBe(false);
  });

  it('沒設過 primary 時回第一個', async () => {
    const { svc } = setup();
    const a = await svc.addDomain({ tenantId: 't1', pageId: 'p1', domain: 'a.example.com' });
    const primary = await svc.getPrimary('t1', 'p1');
    expect(primary?.id).toBe(a.id);
  });
});

describe('LpMultiDomainService.removeDomain', () => {
  it('刪除後可重新繫結同 domain', async () => {
    const { svc } = setup();
    const b = await svc.addDomain({ tenantId: 't1', pageId: 'p1', domain: 'a.example.com' });
    await svc.removeDomain(b.id);
    const b2 = await svc.addDomain({ tenantId: 't1', pageId: 'p2', domain: 'a.example.com' });
    expect(b2.pageId).toBe('p2');
  });
});
