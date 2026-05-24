import { describe, expect, it } from 'vitest';

import { InMemoryB2BStore } from './in-memory-store.js';
import { B2BService } from './service.js';

import type { B2BAccount } from './types.js';

const TENANT = 't1';

function buildAccount(overrides: Partial<B2BAccount> = {}): B2BAccount {
  return {
    id: 'acc-1',
    tenantId: TENANT,
    companyName: '台積電',
    domains: ['tsmc.com', 'tsmc.com.tw'],
    seatsTotal: 3,
    seatsUsed: 0,
    contractStartDate: new Date('2026-01-01'),
    contractEndDate: new Date('2027-01-01'),
    autoEnrollCourses: [],
    status: 'active',
    ...overrides,
  };
}

describe('B2BService.importLearnersFromCsv', () => {
  it('正常匯入並扣席次', async () => {
    const store = new InMemoryB2BStore();
    await store.upsertAccount(buildAccount());
    const svc = new B2BService(store);
    const r = await svc.importLearnersFromCsv({
      tenantId: TENANT,
      b2bAccountId: 'acc-1',
      rows: [
        { email: 'alice@tsmc.com', name: 'Alice', department: 'RD' },
        { email: 'bob@tsmc.com.tw', name: 'Bob', department: 'HR' },
      ],
    });
    expect(r.imported).toBe(2);
    expect(r.skipped).toBe(0);
    const acc = await store.getAccount('acc-1');
    expect(acc?.seatsUsed).toBe(2);
  });

  it('email 格式 / 網域 / 重複 / 席次滿都會 skip', async () => {
    const store = new InMemoryB2BStore();
    await store.upsertAccount(buildAccount({ seatsTotal: 2 }));
    const svc = new B2BService(store);
    const r = await svc.importLearnersFromCsv({
      tenantId: TENANT,
      b2bAccountId: 'acc-1',
      rows: [
        { email: 'a@tsmc.com' },
        { email: 'bad-email' },
        { email: 'b@gmail.com' },
        { email: 'a@tsmc.com' },
        { email: 'c@tsmc.com' },
        { email: 'd@tsmc.com' },
      ],
    });
    expect(r.imported).toBe(2);
    expect(r.reachedSeatLimit).toBe(true);
    const reasons = r.skippedReasons.map((x) => x.reason);
    expect(reasons).toContain('email 格式錯誤');
    expect(reasons.some((s) => s.includes('網域不允許'))).toBe(true);
    expect(reasons).toContain('已存在');
    expect(reasons).toContain('席次已滿');
  });

  it('帳號未啟用 → throw', async () => {
    const store = new InMemoryB2BStore();
    await store.upsertAccount(buildAccount({ status: 'suspended' }));
    const svc = new B2BService(store);
    await expect(
      svc.importLearnersFromCsv({ tenantId: TENANT, b2bAccountId: 'acc-1', rows: [] }),
    ).rejects.toThrow(/未啟用/);
  });
});

describe('B2BService.resolveSsoLogin (JIT)', () => {
  it('首次登入自動建 learner 並扣席次', async () => {
    const store = new InMemoryB2BStore();
    await store.upsertAccount(buildAccount());
    const svc = new B2BService(store);
    const r = await svc.resolveSsoLogin(TENANT, {
      email: 'newbie@tsmc.com',
      name: 'Newbie',
      department: 'RD',
    });
    expect(r.learner.provisioningSource).toBe('sso-jit');
    expect(r.learner.activatedAt).toBeDefined();
    expect(r.account.seatsUsed).toBe(1);
  });

  it('已存在但 inactive → 重新啟用、不重複扣席次', async () => {
    const store = new InMemoryB2BStore();
    await store.upsertAccount(buildAccount({ seatsUsed: 1 }));
    await store.upsertLearner({
      id: 'l-old',
      tenantId: TENANT,
      b2bAccountId: 'acc-1',
      email: 'old@tsmc.com',
      status: 'inactive',
      invitedAt: new Date('2026-01-01'),
      provisioningSource: 'csv-import',
    });
    const svc = new B2BService(store);
    const r = await svc.resolveSsoLogin(TENANT, { email: 'old@tsmc.com' });
    expect(r.learner.status).toBe('active');
    expect(r.account.seatsUsed).toBe(1);
  });

  it('找不到網域對應帳號 → throw', async () => {
    const store = new InMemoryB2BStore();
    await store.upsertAccount(buildAccount());
    const svc = new B2BService(store);
    await expect(
      svc.resolveSsoLogin(TENANT, { email: 'x@unknown.com' }),
    ).rejects.toThrow(/找不到/);
  });

  it('席次滿 → throw', async () => {
    const store = new InMemoryB2BStore();
    await store.upsertAccount(buildAccount({ seatsTotal: 1, seatsUsed: 1 }));
    const svc = new B2BService(store);
    await expect(
      svc.resolveSsoLogin(TENANT, { email: 'new@tsmc.com' }),
    ).rejects.toThrow(/席次已滿/);
  });
});

describe('B2BService.deactivateLearner', () => {
  it('離職釋出席次', async () => {
    const store = new InMemoryB2BStore();
    await store.upsertAccount(buildAccount({ seatsUsed: 1 }));
    await store.upsertLearner({
      id: 'l1',
      tenantId: TENANT,
      b2bAccountId: 'acc-1',
      email: 'leaver@tsmc.com',
      status: 'active',
      invitedAt: new Date(),
      provisioningSource: 'manual',
    });
    const svc = new B2BService(store);
    await svc.deactivateLearner('acc-1', 'leaver@tsmc.com');
    const learner = await store.findLearnerByEmail('acc-1', 'leaver@tsmc.com');
    expect(learner?.status).toBe('departed');
    const acc = await store.getAccount('acc-1');
    expect(acc?.seatsUsed).toBe(0);
  });

  it('已離職重複呼叫不會席次變負', async () => {
    const store = new InMemoryB2BStore();
    await store.upsertAccount(buildAccount({ seatsUsed: 0 }));
    await store.upsertLearner({
      id: 'l1',
      tenantId: TENANT,
      b2bAccountId: 'acc-1',
      email: 'gone@tsmc.com',
      status: 'departed',
      invitedAt: new Date(),
      provisioningSource: 'manual',
    });
    const svc = new B2BService(store);
    await svc.deactivateLearner('acc-1', 'gone@tsmc.com');
    const acc = await store.getAccount('acc-1');
    expect(acc?.seatsUsed).toBe(0);
  });
});

describe('B2BService.generateHrReport', () => {
  it('按部門統計 + 平均完成率', async () => {
    const store = new InMemoryB2BStore();
    await store.upsertAccount(buildAccount({ seatsTotal: 5, seatsUsed: 3 }));
    const base = {
      tenantId: TENANT,
      b2bAccountId: 'acc-1',
      status: 'active' as const,
      invitedAt: new Date(),
      provisioningSource: 'manual' as const,
    };
    await store.upsertLearner({ ...base, id: 'l1', email: 'a@tsmc.com', userId: 'u1', department: 'RD' });
    await store.upsertLearner({ ...base, id: 'l2', email: 'b@tsmc.com', userId: 'u2', department: 'RD' });
    await store.upsertLearner({ ...base, id: 'l3', email: 'c@tsmc.com', userId: 'u3', department: 'HR' });
    const svc = new B2BService(store);
    const progress: Record<string, { completedCourses: number; avgProgress: number }> = {
      u1: { completedCourses: 3, avgProgress: 80 },
      u2: { completedCourses: 1, avgProgress: 50 },
      u3: { completedCourses: 5, avgProgress: 100 },
    };
    const r = await svc.generateHrReport('acc-1', async (uid) => progress[uid] ?? { completedCourses: 0, avgProgress: 0 });
    expect(r.totalLearners).toBe(3);
    expect(r.activeLearners).toBe(3);
    expect(r.seatsRemaining).toBe(2);
    const rd = r.byDepartment.find((d) => d.department === 'RD');
    expect(rd?.completedCourses).toBe(4);
    expect(rd?.avgProgress).toBe(65);
    const hr = r.byDepartment.find((d) => d.department === 'HR');
    expect(hr?.avgProgress).toBe(100);
  });

  it('學員無部門 → 歸到「未分類」', async () => {
    const store = new InMemoryB2BStore();
    await store.upsertAccount(buildAccount());
    await store.upsertLearner({
      id: 'l1',
      tenantId: TENANT,
      b2bAccountId: 'acc-1',
      email: 'x@tsmc.com',
      status: 'active',
      invitedAt: new Date(),
      provisioningSource: 'manual',
    });
    const svc = new B2BService(store);
    const r = await svc.generateHrReport('acc-1', async () => ({ completedCourses: 0, avgProgress: 0 }));
    expect(r.byDepartment[0]?.department).toBe('未分類');
  });
});

describe('B2BService.listLearnerUserIds', () => {
  it('只回 active 且有 userId 的學員', async () => {
    const store = new InMemoryB2BStore();
    await store.upsertAccount(buildAccount());
    const base = {
      tenantId: TENANT,
      b2bAccountId: 'acc-1',
      invitedAt: new Date(),
      provisioningSource: 'manual' as const,
    };
    await store.upsertLearner({ ...base, id: 'l1', email: 'a@tsmc.com', userId: 'u1', status: 'active' });
    await store.upsertLearner({ ...base, id: 'l2', email: 'b@tsmc.com', userId: 'u2', status: 'departed' });
    await store.upsertLearner({ ...base, id: 'l3', email: 'c@tsmc.com', status: 'active' });
    const svc = new B2BService(store);
    const ids = await svc.listLearnerUserIds('acc-1');
    expect(ids).toEqual(['u1']);
  });
});
