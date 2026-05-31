import { describe, expect, it } from 'vitest';

import {
  InMemoryLpVersionStore,
  InMemoryPreviewLinkStore,
} from './in-memory-store.js';
import { LpVersionControlService } from './service.js';

function setup() {
  const versions = new InMemoryLpVersionStore();
  const previews = new InMemoryPreviewLinkStore();
  let n = 0;
  const svc = new LpVersionControlService(versions, previews, {
    now: () => new Date('2026-05-15T10:00:00Z'),
    genId: () => `ver_${++n}`,
    genToken: () => `tok_${n}`,
    passwordHasher: async (p) => `hash(${p})`,
    passwordVerifier: async (p, h) => h === `hash(${p})`,
  });
  return { versions, previews, svc };
}

describe('LpVersionControlService.createVersion', () => {
  it('遞增 version 序號', async () => {
    const { svc } = setup();
    const v1 = await svc.createVersion({
      tenantId: 't1',
      pageId: 'p1',
      snapshot: { pageData: { a: 1 } },
      createdBy: 'u1',
    });
    const v2 = await svc.createVersion({
      tenantId: 't1',
      pageId: 'p1',
      snapshot: { pageData: { a: 2 } },
      createdBy: 'u1',
    });
    expect(v1.version).toBe(1);
    expect(v2.version).toBe(2);
  });

  it('每個 page 版本獨立', async () => {
    const { svc } = setup();
    const a = await svc.createVersion({
      tenantId: 't1',
      pageId: 'p1',
      snapshot: { pageData: {} },
      createdBy: 'u1',
    });
    const b = await svc.createVersion({
      tenantId: 't1',
      pageId: 'p2',
      snapshot: { pageData: {} },
      createdBy: 'u1',
    });
    expect(a.version).toBe(1);
    expect(b.version).toBe(1);
  });
});

describe('LpVersionControlService.promoteToProduction', () => {
  it('一次只能一個 isProduction', async () => {
    const { svc } = setup();
    const v1 = await svc.createVersion({
      tenantId: 't1',
      pageId: 'p1',
      snapshot: { pageData: { v: 1 } },
      createdBy: 'u1',
    });
    const v2 = await svc.createVersion({
      tenantId: 't1',
      pageId: 'p1',
      snapshot: { pageData: { v: 2 } },
      createdBy: 'u1',
    });
    await svc.promoteToProduction(v1.id);
    let prod = await svc.getProduction('t1', 'p1');
    expect(prod?.id).toBe(v1.id);
    await svc.promoteToProduction(v2.id);
    prod = await svc.getProduction('t1', 'p1');
    expect(prod?.id).toBe(v2.id);
  });
});

describe('LpVersionControlService.restore', () => {
  it('把舊版 snapshot 複製成新版本', async () => {
    const { svc } = setup();
    const old = await svc.createVersion({
      tenantId: 't1',
      pageId: 'p1',
      snapshot: { pageData: { old: true } },
      createdBy: 'u1',
      name: '夏季版',
    });
    await svc.createVersion({
      tenantId: 't1',
      pageId: 'p1',
      snapshot: { pageData: { current: true } },
      createdBy: 'u1',
    });
    const restored = await svc.restore(old.id, 'u2');
    expect(restored.version).toBe(3);
    expect(restored.snapshot.pageData).toEqual({ old: true });
    expect(restored.name).toContain('還原');
  });
});

describe('LpVersionControlService 排程', () => {
  it('過去時間 → throw', async () => {
    const { svc } = setup();
    const v = await svc.createVersion({
      tenantId: 't1',
      pageId: 'p1',
      snapshot: { pageData: {} },
      createdBy: 'u1',
    });
    await expect(svc.schedule(v.id, new Date('2020-01-01'))).rejects.toThrow(/大於現在/);
  });

  it('runScheduledPromotion 把到期版本上線', async () => {
    const { svc } = setup();
    const v = await svc.createVersion({
      tenantId: 't1',
      pageId: 'p1',
      snapshot: { pageData: {} },
      createdBy: 'u1',
    });
    await svc.schedule(v.id, new Date('2026-05-15T12:00:00Z'));
    const before = await svc.runScheduledPromotion(
      't1',
      'p1',
      new Date('2026-05-15T11:00:00Z'),
    );
    expect(before).toHaveLength(0);
    const after = await svc.runScheduledPromotion(
      't1',
      'p1',
      new Date('2026-05-15T13:00:00Z'),
    );
    expect(after).toHaveLength(1);
    expect(after[0]?.isProduction).toBe(true);
  });
});

describe('LpVersionControlService 預覽連結', () => {
  it('密碼保護 → 帶錯回 undefined', async () => {
    const { svc } = setup();
    const v = await svc.createVersion({
      tenantId: 't1',
      pageId: 'p1',
      snapshot: { pageData: { sneak: true } },
      createdBy: 'u1',
    });
    const link = await svc.createPreviewLink({ versionId: v.id, password: 'open' });
    expect(await svc.resolvePreview(link.token, 'wrong')).toBeUndefined();
    expect(await svc.resolvePreview(link.token, 'open')).toBeDefined();
  });

  it('過期 → undefined', async () => {
    const { svc } = setup();
    const v = await svc.createVersion({
      tenantId: 't1',
      pageId: 'p1',
      snapshot: { pageData: {} },
      createdBy: 'u1',
    });
    const link = await svc.createPreviewLink({
      versionId: v.id,
      expiresAt: new Date('2026-05-14T00:00:00Z'),
    });
    expect(await svc.resolvePreview(link.token)).toBeUndefined();
  });
});
