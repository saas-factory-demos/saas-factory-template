import { describe, expect, it } from 'vitest';

import {
  handleAuditLog,
  handleDisable,
  handleEnable,
  handleProvision,
  handleRotate,
  handleStatus,
  sanitizeIp,
  type PayloadLike,
} from './factory-support-handlers.js';

/** In-memory fake Payload，覆蓋 PayloadLike 4 method。
 *  測試完整生命週期：create → find → update → count。 */
function makeFakePayload(initial: {
  users?: Array<{
    id: number;
    email: string;
    role?: string;
    factoryAccessDisabledAt?: string | null;
    isFactoryManaged?: boolean;
    password?: string;
  }>;
  logs?: Array<{
    id: number;
    action: string;
    actorEmail: string;
    payloadSummary: string;
    timestamp: string;
    clientIp?: string;
    userAgent?: string;
    relatedUserId?: number;
  }>;
} = {}): {
  payload: PayloadLike;
  state: {
    users: Array<Record<string, unknown> & { id: number }>;
    logs: Array<Record<string, unknown> & { id: number }>;
    createCalls: Array<{ collection: string; data: Record<string, unknown>; context?: Record<string, unknown> }>;
    updateCalls: Array<{ collection: string; id: number | string; data: Record<string, unknown>; context?: Record<string, unknown> }>;
  };
} {
  const users: Array<Record<string, unknown> & { id: number }> = (initial.users ?? []).map((u) => ({ ...u }));
  const logs: Array<Record<string, unknown> & { id: number }> = (initial.logs ?? []).map((l) => ({ ...l }));
  const createCalls: Array<{ collection: string; data: Record<string, unknown>; context?: Record<string, unknown> }> = [];
  const updateCalls: Array<{ collection: string; id: number | string; data: Record<string, unknown>; context?: Record<string, unknown> }> = [];
  let nextId = Math.max(0, ...users.map((u) => u.id), ...logs.map((l) => l.id)) + 1;

  /** 把測試傳進來的 where 拆開比對（簡化版，僅支援本檔需要的格式）。 */
  function matchesWhere(doc: Record<string, unknown>, where: unknown): boolean {
    if (!where || typeof where !== 'object') return true;
    const w = where as Record<string, unknown>;
    if ('and' in w && Array.isArray(w.and)) {
      return w.and.every((sub) => matchesWhere(doc, sub));
    }
    for (const [field, cond] of Object.entries(w)) {
      if (!cond || typeof cond !== 'object') continue;
      const c = cond as Record<string, unknown>;
      const v = doc[field];
      if ('equals' in c && v !== c.equals) return false;
      if ('not_equals' in c && v === c.not_equals) return false;
      if ('greater_than_equal' in c && typeof v === 'string' && typeof c.greater_than_equal === 'string') {
        if (v < c.greater_than_equal) return false;
      }
      if ('less_than' in c && typeof v === 'string' && typeof c.less_than === 'string') {
        if (v >= c.less_than) return false;
      }
    }
    return true;
  }

  const payload: PayloadLike = {
    async find(args) {
      const list = args.collection === 'users' ? users : logs;
      let result = list.filter((doc) => matchesWhere(doc, args.where));
      if (args.sort) {
        const desc = args.sort.startsWith('-');
        const field = desc ? args.sort.slice(1) : args.sort;
        result = [...result].sort((a, b) => {
          const av = String(a[field] ?? '');
          const bv = String(b[field] ?? '');
          return desc ? bv.localeCompare(av) : av.localeCompare(bv);
        });
      }
      const limit = args.limit ?? 10;
      const docs = result.slice(0, limit);
      return { docs, totalDocs: result.length };
    },
    async create(args) {
      createCalls.push({
        collection: args.collection,
        data: args.data,
        ...(args.context ? { context: args.context } : {}),
      });
      const list = args.collection === 'users' ? users : logs;
      const doc = { id: nextId++, ...args.data };
      list.push(doc);
      return doc;
    },
    async update(args) {
      updateCalls.push({
        collection: args.collection,
        id: args.id,
        data: args.data,
        ...(args.context ? { context: args.context } : {}),
      });
      const list = args.collection === 'users' ? users : logs;
      const idx = list.findIndex((d) => d.id === Number(args.id));
      if (idx === -1) throw new Error(`fake payload: not found id=${args.id}`);
      list[idx] = { ...list[idx]!, ...args.data };
      return list[idx];
    },
    async count(args) {
      const list = args.collection === 'users' ? users : logs;
      const filtered = list.filter((doc) => matchesWhere(doc, args.where));
      return { totalDocs: filtered.length };
    },
  };

  return { payload, state: { users, logs, createCalls, updateCalls } };
}

describe('handleProvision', () => {
  it('無既有帳號 → 建立新 user + 回 initialPassword', async () => {
    const { payload, state } = makeFakePayload();
    const res = await handleProvision(
      payload,
      { email: 'support+demo@example.com', actorEmail: 'me@example.com' },
      { clientIp: '1.2.3.0/24' },
    );
    expect(res.ok).toBe(true);
    expect(res.alreadyProvisioned).toBe(false);
    expect(res.initialPassword).toMatch(/^[A-Za-z0-9_-]{20,}$/);
    expect(state.users).toHaveLength(1);
    expect(state.users[0]).toMatchObject({
      email: 'support+demo@example.com',
      role: 'factory-support',
      isFactoryManaged: true,
    });
    // create user 應帶 context override flag（讓 beforeChange hook 放行）
    const userCreate = state.createCalls.find((c) => c.collection === 'users');
    expect(userCreate?.context).toEqual({ 'support-access-override': true });
    // 同時寫 audit log
    expect(state.logs).toHaveLength(1);
    expect(state.logs[0]).toMatchObject({
      action: 'provision',
      actorEmail: 'me@example.com',
      clientIp: '1.2.3.0/24',
    });
  });

  it('已有 factory-support 帳號 → idempotent，回 alreadyProvisioned=true，不建新 user', async () => {
    const { payload, state } = makeFakePayload({
      users: [{ id: 1, email: 'support+demo@example.com', role: 'factory-support' }],
    });
    const res = await handleProvision(
      payload,
      { email: 'support+demo@example.com', actorEmail: 'me@example.com' },
      {},
    );
    expect(res).toEqual({ ok: true, initialPassword: null, alreadyProvisioned: true });
    expect(state.users).toHaveLength(1); // 沒新增
    expect(state.createCalls.filter((c) => c.collection === 'users')).toHaveLength(0);
    // audit log 仍寫一筆
    expect(state.logs).toHaveLength(1);
    expect(state.logs[0]?.payloadSummary).toMatch(/idempotent/);
  });
});

describe('handleRotate', () => {
  it('無帳號 → throw', async () => {
    const { payload } = makeFakePayload();
    await expect(
      handleRotate(payload, { actorEmail: 'me@example.com', reason: 'test' }, {}),
    ).rejects.toThrow(/不存在/);
  });

  it('有帳號 → 產新密碼 + 寫 user + 寫 audit log', async () => {
    const { payload, state } = makeFakePayload({
      users: [{ id: 1, email: 'support+demo@example.com', role: 'factory-support', password: 'OLD' }],
    });
    const res = await handleRotate(
      payload,
      { actorEmail: 'me@example.com', reason: '季度 rotate' },
      {},
    );
    expect(res.ok).toBe(true);
    expect(res.newPassword).toMatch(/^[A-Za-z0-9_-]{20,}$/);
    // user.password 已更新（但不要等於回傳值的字串比對，確保不是空）
    const updated = state.users[0]!;
    expect(updated.password).toBe(res.newPassword);
    expect(updated.password).not.toBe('OLD');
    // update 帶 context flag
    expect(state.updateCalls[0]?.context).toEqual({ 'support-access-override': true });
    // audit log
    expect(state.logs[0]).toMatchObject({
      action: 'rotate-password',
      payloadSummary: expect.stringContaining('季度 rotate') as unknown,
    });
  });
});

describe('handleDisable / handleEnable', () => {
  it('disable → 設 factoryAccessDisabledAt + audit log', async () => {
    const { payload, state } = makeFakePayload({
      users: [{ id: 1, email: 'support@example.com', role: 'factory-support' }],
    });
    const res = await handleDisable(
      payload,
      { actorEmail: 'me@example.com', reason: '客戶要求停用' },
      {},
    );
    expect(res.ok).toBe(true);
    expect(res.disabledAt).toMatch(/^\d{4}-/);
    expect(state.users[0]?.factoryAccessDisabledAt).toBe(res.disabledAt);
    expect(state.logs[0]?.action).toBe('disable');
  });

  it('enable → 清掉 factoryAccessDisabledAt', async () => {
    const { payload, state } = makeFakePayload({
      users: [
        {
          id: 1,
          email: 'support@example.com',
          role: 'factory-support',
          factoryAccessDisabledAt: '2026-05-01T00:00:00Z',
        },
      ],
    });
    const res = await handleEnable(
      payload,
      { actorEmail: 'me@example.com', reason: '客戶請求恢復' },
      {},
    );
    expect(res.ok).toBe(true);
    expect(state.users[0]?.factoryAccessDisabledAt).toBeNull();
    expect(state.logs[0]?.action).toBe('enable');
  });

  it('disable 無帳號 → throw', async () => {
    const { payload } = makeFakePayload();
    await expect(
      handleDisable(payload, { actorEmail: 'me@example.com', reason: 'x' }, {}),
    ).rejects.toThrow(/不存在/);
  });
});

describe('handleStatus', () => {
  it('無 factory-support 帳號 → provisioned=false 全 0', async () => {
    const { payload } = makeFakePayload();
    const res = await handleStatus(payload, { actorEmail: 'me@example.com' });
    expect(res).toEqual({
      ok: true,
      provisioned: false,
      disabled: false,
      lastLoginAt: null,
      monthlyAccessCount: 0,
    });
  });

  it('有帳號 + 本月有 log → provisioned=true + monthlyAccessCount 對', async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString();
    const { payload } = makeFakePayload({
      users: [{ id: 1, email: 'support@example.com', role: 'factory-support' }],
      logs: [
        { id: 10, action: 'rotate-password', actorEmail: 'me', payloadSummary: '', timestamp: monthStart },
        { id: 11, action: 'login', actorEmail: 'me', payloadSummary: '', timestamp: now.toISOString() },
        // 上個月 → 不該計入
        { id: 9, action: 'provision', actorEmail: 'me', payloadSummary: '', timestamp: lastMonth },
      ],
    });
    const res = await handleStatus(payload, { actorEmail: 'me@example.com' });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.provisioned).toBe(true);
      expect(res.disabled).toBe(false);
      expect(res.monthlyAccessCount).toBe(2); // 本月 2 筆，上月不算
      expect(res.lastLoginAt).toBe(now.toISOString());
    }
  });

  it('帳號被 disable → disabled=true', async () => {
    const { payload } = makeFakePayload({
      users: [
        {
          id: 1,
          email: 'support@example.com',
          role: 'factory-support',
          factoryAccessDisabledAt: '2026-05-15T00:00:00Z',
        },
      ],
    });
    const res = await handleStatus(payload, { actorEmail: 'me@example.com' });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.disabled).toBe(true);
  });
});

describe('handleAuditLog', () => {
  it('預設 limit=20 抓最新前 20 筆，desc by timestamp', async () => {
    const logs = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      action: 'rotate-password',
      actorEmail: 'me',
      payloadSummary: `op ${i + 1}`,
      timestamp: new Date(2026, 0, i + 1).toISOString(),
    }));
    const { payload } = makeFakePayload({ logs });
    const res = await handleAuditLog(payload, { actorEmail: 'me@example.com' });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.entries).toHaveLength(20);
      // 最新一筆應該是 op 25
      expect(res.entries[0]?.payloadSummary).toBe('op 25');
      // 有 next cursor（還有 5 筆）
      expect(res.nextCursor).toBe(res.entries[19]?.timestamp);
      expect(res.totalEstimate).toBe(25);
    }
  });

  it('limit=100 + 不到 100 筆 → nextCursor=null', async () => {
    const logs = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      action: 'provision',
      actorEmail: 'me',
      payloadSummary: `op ${i + 1}`,
      timestamp: new Date(2026, 0, i + 1).toISOString(),
    }));
    const { payload } = makeFakePayload({ logs });
    const res = await handleAuditLog(payload, { actorEmail: 'me@example.com', limit: 100 });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.entries).toHaveLength(5);
      expect(res.nextCursor).toBeNull();
    }
  });

  it('filterAction 篩 login → 只回 login 紀錄', async () => {
    const logs = [
      { id: 1, action: 'rotate-password', actorEmail: 'me', payloadSummary: '', timestamp: '2026-01-01T00:00:00Z' },
      { id: 2, action: 'login', actorEmail: 'me', payloadSummary: '', timestamp: '2026-01-02T00:00:00Z' },
      { id: 3, action: 'login', actorEmail: 'me', payloadSummary: '', timestamp: '2026-01-03T00:00:00Z' },
      { id: 4, action: 'disable', actorEmail: 'me', payloadSummary: '', timestamp: '2026-01-04T00:00:00Z' },
    ];
    const { payload } = makeFakePayload({ logs });
    const res = await handleAuditLog(payload, {
      actorEmail: 'me@example.com',
      filterAction: 'login',
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.entries).toHaveLength(2);
      expect(res.entries.every((e) => e.action === 'login')).toBe(true);
    }
  });

  it('totalDocs > 1000 → totalEstimate 顯示 1000', async () => {
    const logs = Array.from({ length: 1500 }, (_, i) => ({
      id: i + 1,
      action: 'rotate-password',
      actorEmail: 'me',
      payloadSummary: '',
      timestamp: new Date(2025, 0, i + 1).toISOString(),
    }));
    const { payload } = makeFakePayload({ logs });
    const res = await handleAuditLog(payload, { actorEmail: 'me@example.com', limit: 5 });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.totalEstimate).toBe(1000);
  });

  it('limit 越界自動 clamp（傳 200 → 視為 100）', async () => {
    const logs = Array.from({ length: 150 }, (_, i) => ({
      id: i + 1,
      action: 'rotate-password',
      actorEmail: 'me',
      payloadSummary: '',
      timestamp: new Date(2025, 0, i + 1).toISOString(),
    }));
    const { payload } = makeFakePayload({ logs });
    const res = await handleAuditLog(payload, { actorEmail: 'me@example.com', limit: 200 });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.entries.length).toBe(100); // clamp
  });
});

describe('sanitizeIp', () => {
  it('null → undefined', () => {
    expect(sanitizeIp(null)).toBeUndefined();
  });

  it('IPv4 → /24', () => {
    expect(sanitizeIp('203.0.113.45')).toBe('203.0.113.0/24');
  });

  it('IPv4 chain（X-Forwarded-For 多 hop）→ 取第一個', () => {
    expect(sanitizeIp('203.0.113.45, 10.0.0.1')).toBe('203.0.113.0/24');
  });

  it('IPv6 → /48', () => {
    expect(sanitizeIp('2001:db8:abcd:1234::1')).toBe('2001:db8:abcd::/48');
  });

  it('格式爛 → undefined', () => {
    expect(sanitizeIp('not-an-ip')).toBeUndefined();
    expect(sanitizeIp('1.2.3')).toBeUndefined();
  });
});
