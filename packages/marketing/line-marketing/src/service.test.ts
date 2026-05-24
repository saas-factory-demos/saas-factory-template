import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  InMemoryFriendStore,
  InMemoryPushJobStore,
  InMemoryQuotaStore,
  InMemoryRichMenuScheduleStore,
  InMemoryRichMenuStore,
} from './in-memory-store.js';
import { LineMarketingService, yearMonthOf } from './service.js';

import type { LinePushHandler, LineSegmentResolver, QuotaPolicy } from './types.js';

describe('LineMarketingService', () => {
  let pushJobs: InMemoryPushJobStore;
  let quota: InMemoryQuotaStore;
  let friends: InMemoryFriendStore;
  let richMenus: InMemoryRichMenuStore;
  let richMenuSchedules: InMemoryRichMenuScheduleStore;
  let pusher: { push: ReturnType<typeof vi.fn<LinePushHandler['push']>> };
  let resolveSegment: ReturnType<typeof vi.fn<LineSegmentResolver>>;
  let service: LineMarketingService;
  let counter = 0;
  const now = new Date('2026-05-15T00:00:00Z');
  const policy: QuotaPolicy = { monthlyLimit: 1000, broadcastFloorRatio: 0.1 };

  beforeEach(() => {
    pushJobs = new InMemoryPushJobStore();
    quota = new InMemoryQuotaStore();
    friends = new InMemoryFriendStore();
    richMenus = new InMemoryRichMenuStore();
    richMenuSchedules = new InMemoryRichMenuScheduleStore();
    pusher = {
      push: vi.fn<LinePushHandler['push']>(async ({ target, messages }) => {
        const base = target.kind === 'multicast' ? target.userIds.length : 3;
        return { ok: true, sentCount: base * messages.length };
      }),
    };
    resolveSegment = vi.fn<LineSegmentResolver>(async () => ['U1', 'U2', 'U3']);
    counter = 0;
    service = new LineMarketingService(
      pushJobs,
      quota,
      friends,
      richMenus,
      richMenuSchedules,
      { pusher, resolveSegment },
      policy,
      { now: () => now, genId: () => `id_${++counter}` },
    );
  });

  it('好友 follow / unfollow / linkCustomer', async () => {
    const f = await service.onFollow({ tenantId: 't1', lineUserId: 'U1', displayName: 'Alice' });
    expect(f.blocked).toBe(false);
    const linked = await service.linkCustomer({ tenantId: 't1', lineUserId: 'U1', customerId: 'C1' });
    expect(linked.customerId).toBe('C1');
    const uf = await service.onUnfollow({ tenantId: 't1', lineUserId: 'U1' });
    expect(uf?.blocked).toBe(true);
    const active = await friends.listActive('t1');
    expect(active).toHaveLength(0);
  });

  it('createJob / scheduleJob / runJob multicast 扣配額', async () => {
    const job = await service.createJob({
      tenantId: 't1',
      name: '促銷',
      target: { kind: 'multicast', userIds: ['U1', 'U2'] },
      messages: [{ type: 'text', text: 'hi' }],
      scheduledAt: new Date(now.getTime() - 1000),
    });
    const sched = await service.scheduleJob(job.id);
    expect(sched.status).toBe('scheduled');
    expect(sched.estimatedMessages).toBe(2);
    const ran = await service.dispatchDue('t1');
    expect(ran).toHaveLength(1);
    expect(ran[0]?.status).toBe('sent');
    expect(ran[0]?.sentMessages).toBe(2);
    const usage = await service.getMonthlyUsage('t1', now);
    expect(usage.used).toBe(2);
    expect(usage.remaining).toBe(998);
  });

  it('配額不足 → job failed 並不扣配額', async () => {
    // 預先用掉 999
    await quota.addUsage('t1', yearMonthOf(now), 999);
    const job = await service.createJob({
      tenantId: 't1',
      name: 'big',
      target: { kind: 'narrowcast', segmentId: 'seg1' },
      messages: [{ type: 'text', text: 'x' }],
      scheduledAt: new Date(now.getTime() - 1000),
    });
    await service.scheduleJob(job.id);
    const ran = await service.runJob(job.id);
    expect(ran.status).toBe('failed');
    expect(ran.error).toBe('本月配額不足');
    expect(pusher.push).not.toHaveBeenCalled();
    const usage = await service.getMonthlyUsage('t1', now);
    expect(usage.used).toBe(999);
  });

  it('broadcast floor 防呆：剩餘配額低於 floor 不准 schedule', async () => {
    await quota.addUsage('t1', yearMonthOf(now), 950); // 剩 50，floor=100
    await service.onFollow({ tenantId: 't1', lineUserId: 'U1' });
    const job = await service.createJob({
      tenantId: 't1',
      name: 'bc',
      target: { kind: 'broadcast' },
      messages: [{ type: 'text', text: 'bc' }],
      scheduledAt: new Date(now.getTime() - 1000),
    });
    await expect(service.scheduleJob(job.id)).rejects.toThrow('broadcast floor');
  });

  it('rich menu publish 與排程 tick', async () => {
    const rm = await service.createRichMenu({
      tenantId: 't1',
      name: '主選單',
      size: { width: 2500, height: 1686 },
      selected: true,
      chatBarText: '選單',
      areas: [],
    });
    const pub = await service.publishRichMenu(rm.id);
    expect(pub.status).toBe('published');
    const sched = await service.scheduleRichMenu({
      tenantId: 't1',
      richMenuId: rm.id,
      scope: { kind: 'default' },
      from: new Date(now.getTime() - 1000),
      until: new Date(now.getTime() + 60_000),
    });
    expect(sched.status).toBe('pending');
    const ticked = await service.tickRichMenuSchedules('t1');
    expect(ticked[0]?.status).toBe('active');
  });

  it('cancelJob 與狀態錯誤', async () => {
    const job = await service.createJob({
      tenantId: 't1',
      name: '取消',
      target: { kind: 'multicast', userIds: ['U1'] },
      messages: [{ type: 'text', text: 'x' }],
      scheduledAt: new Date(now.getTime() + 10_000),
    });
    const cancelled = await service.cancelJob(job.id);
    expect(cancelled.status).toBe('cancelled');
    await expect(service.scheduleJob(job.id)).rejects.toThrow('狀態錯誤');
  });

  it('messages 數量驗證', async () => {
    await expect(
      service.createJob({
        tenantId: 't1',
        name: 'empty',
        target: { kind: 'broadcast' },
        messages: [],
        scheduledAt: now,
      }),
    ).rejects.toThrow('messages 不可為空');
    await expect(
      service.createJob({
        tenantId: 't1',
        name: 'over',
        target: { kind: 'broadcast' },
        messages: Array.from({ length: 6 }, () => ({ type: 'text' as const, text: 'x' })),
        scheduledAt: now,
      }),
    ).rejects.toThrow('最多 5');
  });
});
