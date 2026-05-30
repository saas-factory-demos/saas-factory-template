import { describe, expect, it, vi } from 'vitest';

import {
  InMemoryCouponClaimStore,
  InMemoryRecoveryAttemptStore,
} from './in-memory-store.js';
import { AbandonedCartService, DEFAULT_RECOVERY_FLOW } from './service.js';

import type { CartSnapshot, ChannelSender } from './types.js';

const tenantId = 'tenant-1';

function makeService(opts?: { sender?: ChannelSender; now?: () => Date }) {
  const attempts = new InMemoryRecoveryAttemptStore();
  const claims = new InMemoryCouponClaimStore();
  let counter = 0;
  const sender: ChannelSender =
    opts?.sender ?? { send: vi.fn<ChannelSender['send']>(async () => ({ ok: true })) };
  const svc = new AbandonedCartService(attempts, claims, sender, {
    now: opts?.now ?? (() => new Date('2026-05-15T00:00:00Z')),
    genId: () => `att_${++counter}`,
  });
  return { svc, attempts, claims, sender };
}

function snapshot(overrides?: Partial<CartSnapshot>): CartSnapshot {
  return {
    cartId: 'cart-1',
    tenantId,
    customerId: 'cust-1',
    customerEmail: 'a@example.com',
    customerLine: 'U-line-1',
    totalMinor: 99000,
    itemCount: 2,
    lastActivityAt: new Date('2026-05-15T00:00:00Z'),
    ...overrides,
  };
}

describe('AbandonedCartService', () => {
  it('scheduleRecovery 依 config 建立 3 段 pending attempts', async () => {
    const { svc, attempts } = makeService();
    const created = await svc.scheduleRecovery(snapshot(), DEFAULT_RECOVERY_FLOW);
    expect(created).toHaveLength(3);
    expect(created.every((a) => a.status === 'pending')).toBe(true);
    expect((await attempts.listByCart('cart-1'))).toHaveLength(3);
  });

  it('minOrderMinor 不符的 stage 會跳過', async () => {
    const { svc } = makeService();
    const config = {
      ...DEFAULT_RECOVERY_FLOW,
      stages: [
        ...DEFAULT_RECOVERY_FLOW.stages,
        { delayMs: 96 * 60 * 60 * 1000, channels: ['sms'] as const as ['sms'], templateId: 'sms-vip', minOrderMinor: 200000 },
      ],
    };
    const created = await svc.scheduleRecovery(snapshot({ totalMinor: 99000 }), config);
    expect(created).toHaveLength(3); // 第 4 段被跳過
  });

  it('dispatchDue 對到時間的 attempt 走 channel sender + 標 sent', async () => {
    const send = vi.fn<ChannelSender['send']>(async () => ({ ok: true }));
    const { svc, attempts } = makeService({ sender: { send } });
    await svc.scheduleRecovery(snapshot(), DEFAULT_RECOVERY_FLOW);
    const now = new Date('2026-05-15T01:30:00Z'); // 過 1 小時後
    const dispatched = await svc.dispatchDue(tenantId, DEFAULT_RECOVERY_FLOW, now);
    expect(dispatched).toHaveLength(1);
    expect(dispatched[0]?.status).toBe('sent');
    expect(send).toHaveBeenCalledWith('email', expect.anything(), expect.objectContaining({ templateId: 'cart-abandoned-1' }));

    const all = await attempts.listByCart('cart-1');
    expect(all.filter((a) => a.status === 'pending')).toHaveLength(2);
  });

  it('sender 失敗時 attempt 標 failed', async () => {
    const send = vi.fn<ChannelSender['send']>(async () => ({ ok: false, reason: 'SMTP down' }));
    const { svc } = makeService({ sender: { send } });
    await svc.scheduleRecovery(snapshot(), DEFAULT_RECOVERY_FLOW);
    const dispatched = await svc.dispatchDue(tenantId, DEFAULT_RECOVERY_FLOW, new Date('2026-05-15T01:30:00Z'));
    expect(dispatched[0]?.status).toBe('failed');
  });

  it('cancelByCart 把所有 pending 標 skipped', async () => {
    const { svc, attempts } = makeService();
    await svc.scheduleRecovery(snapshot(), DEFAULT_RECOVERY_FLOW);
    const cancelled = await svc.cancelByCart('cart-1', '客戶恢復活動');
    expect(cancelled).toHaveLength(3);
    expect((await attempts.listByCart('cart-1')).every((a) => a.status === 'skipped')).toBe(true);
  });

  it('客戶每月只能領一次棄單折扣（quota）', async () => {
    const send = vi.fn<ChannelSender['send']>(async () => ({ ok: true }));
    const { svc, claims } = makeService({ sender: { send } });
    await svc.scheduleRecovery(snapshot(), DEFAULT_RECOVERY_FLOW);

    // 觸發第一段（無折扣）
    await svc.dispatchDue(tenantId, DEFAULT_RECOVERY_FLOW, new Date('2026-05-15T01:30:00Z'));
    // 觸發第二段（有折扣 COMEBACK5）
    await svc.dispatchDue(tenantId, DEFAULT_RECOVERY_FLOW, new Date('2026-05-16T01:30:00Z'));
    expect(send).toHaveBeenLastCalledWith('email', expect.anything(), expect.objectContaining({ couponCode: 'COMEBACK5' }));
    expect(await claims.countForMonth(tenantId, 'cust-1', 2026, 4)).toBe(1); // 5 月對應 UTC month 4

    // 觸發第三段（有折扣 COMEBACK10，但月內已領過 → couponCode 被吃掉）
    send.mockClear();
    await svc.dispatchDue(tenantId, DEFAULT_RECOVERY_FLOW, new Date('2026-05-18T01:30:00Z'));
    const stage3Calls = send.mock.calls;
    expect(stage3Calls.every((c) => (c[2] as { couponCode?: string }).couponCode === undefined)).toBe(true);
  });

  it('recordOutcome + funnelStats 統計轉換漏斗', async () => {
    const { svc } = makeService();
    const created = await svc.scheduleRecovery(snapshot({ totalMinor: 100000 }), DEFAULT_RECOVERY_FLOW);
    await svc.send(created[0]!, DEFAULT_RECOVERY_FLOW.stages[0]!, DEFAULT_RECOVERY_FLOW);
    await svc.recordOutcome(created[0]!.id, 'email', 'opened');
    await svc.recordOutcome(created[0]!.id, 'email', 'clicked');
    await svc.recordOutcome(created[0]!.id, 'email', 'converted');

    const stats = await svc.funnelStats(tenantId);
    expect(stats.scheduled).toBe(3);
    expect(stats.sent).toBe(1);
    expect(stats.opened).toBe(1);
    expect(stats.clicked).toBe(1);
    expect(stats.converted).toBe(1);
    expect(stats.conversionRate).toBe(1);
    expect(stats.recoveredRevenueMinor).toBe(100000);
  });

  it('多 channel fan-out：email + line 都會送', async () => {
    const send = vi.fn<ChannelSender['send']>(async () => ({ ok: true }));
    const { svc } = makeService({ sender: { send } });
    await svc.scheduleRecovery(snapshot(), DEFAULT_RECOVERY_FLOW);
    await svc.dispatchDue(tenantId, DEFAULT_RECOVERY_FLOW, new Date('2026-05-18T01:30:00Z'));
    // 第 3 段同時 email + line
    const stage3Calls = send.mock.calls.filter((c) => (c[2] as { templateId: string }).templateId === 'cart-abandoned-3');
    const channels = stage3Calls.map((c) => c[0]);
    expect(channels).toContain('email');
    expect(channels).toContain('line');
  });
});
