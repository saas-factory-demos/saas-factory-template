import { describe, expect, it } from 'vitest';

import { InMemoryInstructorStore } from './in-memory-store.js';
import { InstructorService } from './service.js';

import type { WatchEvent } from './types.js';

const TENANT = 't1';
const INSTRUCTOR = 'inst-1';
const COURSE = 'course-1';

function ev(over: Partial<WatchEvent>): WatchEvent {
  return {
    userId: 'u1',
    lessonId: 'l1',
    timestampSeconds: 0,
    type: 'play',
    occurredAt: new Date(),
    ...over,
  };
}

describe('InstructorService.analyzeEngagement', () => {
  it('偵測精華 / 流失 / 重看 + 完課率', async () => {
    const store = new InMemoryInstructorStore();
    const svc = new InstructorService(store);
    // 在 60-69 秒堆 play（精華），90-99 秒堆 seek-out（流失），30-39 秒堆 replay
    for (let i = 0; i < 20; i++) {
      await svc.recordWatchEvent(ev({ userId: `u${i}`, timestampSeconds: 65, type: 'play' }));
    }
    for (let i = 0; i < 15; i++) {
      await svc.recordWatchEvent(ev({ userId: `u${i}`, timestampSeconds: 95, type: 'seek-out' }));
    }
    for (let i = 0; i < 12; i++) {
      await svc.recordWatchEvent(ev({ userId: `u${i}`, timestampSeconds: 35, type: 'replay' }));
    }
    // 10/20 完課
    for (let i = 0; i < 10; i++) {
      await svc.recordWatchEvent(ev({ userId: `u${i}`, timestampSeconds: 120, type: 'completed' }));
    }
    const r = await svc.analyzeEngagement({ lessonId: 'l1', durationSeconds: 120, bucketSeconds: 10 });
    expect(r.highlights.some((s) => s.startSecond === 60)).toBe(true);
    expect(r.dropOffs.some((s) => s.startSecond === 90)).toBe(true);
    expect(r.replays.some((s) => s.startSecond === 30)).toBe(true);
    expect(r.completionRate).toBe(0.5);
  });

  it('無事件 → completionRate 0、無任何段', async () => {
    const svc = new InstructorService(new InMemoryInstructorStore());
    const r = await svc.analyzeEngagement({ lessonId: 'l-empty', durationSeconds: 60 });
    expect(r.completionRate).toBe(0);
    expect(r.highlights).toHaveLength(0);
  });
});

describe('InstructorService.computeRevenue', () => {
  it('收益 = 銷售 - 退款，扣平台費後 = payout', async () => {
    const store = new InMemoryInstructorStore();
    const svc = new InstructorService(store);
    const t0 = new Date('2026-05-01');
    const t1 = new Date('2026-05-31');
    await svc.recordRevenueEvent({
      id: 'r1', tenantId: TENANT, instructorId: INSTRUCTOR, courseId: COURSE,
      amountMinor: 100000, platformFeeRate: 0.2, type: 'sale', occurredAt: new Date('2026-05-10'),
    });
    await svc.recordRevenueEvent({
      id: 'r2', tenantId: TENANT, instructorId: INSTRUCTOR, courseId: COURSE,
      amountMinor: 100000, platformFeeRate: 0.2, type: 'sale', occurredAt: new Date('2026-05-15'),
    });
    await svc.recordRevenueEvent({
      id: 'r3', tenantId: TENANT, instructorId: INSTRUCTOR, courseId: COURSE,
      amountMinor: 50000, platformFeeRate: 0.2, type: 'refund', occurredAt: new Date('2026-05-20'),
    });
    const r = await svc.computeRevenue(INSTRUCTOR, t0, t1);
    expect(r.grossMinor).toBe(200000);
    expect(r.refundMinor).toBe(50000);
    expect(r.netMinor).toBe(150000);
    expect(r.platformFeeMinor).toBe(30000);
    expect(r.payoutMinor).toBe(120000);
    expect(r.byCourse[0]?.courseId).toBe(COURSE);
  });

  it('區間外事件不算', async () => {
    const store = new InMemoryInstructorStore();
    const svc = new InstructorService(store);
    await svc.recordRevenueEvent({
      id: 'r1', tenantId: TENANT, instructorId: INSTRUCTOR, courseId: COURSE,
      amountMinor: 100000, platformFeeRate: 0.2, type: 'sale', occurredAt: new Date('2026-04-01'),
    });
    const r = await svc.computeRevenue(INSTRUCTOR, new Date('2026-05-01'), new Date('2026-05-31'));
    expect(r.grossMinor).toBe(0);
  });
});

describe('InstructorService.requestPayout / processPayout', () => {
  it('完整流程 pending → approved → paid', async () => {
    const svc = new InstructorService(new InMemoryInstructorStore());
    const p = await svc.requestPayout({
      tenantId: TENANT, instructorId: INSTRUCTOR, amountMinor: 50000,
      method: 'bank-transfer', payeeRef: 'bank-ref-1',
    });
    expect(p.status).toBe('pending');
    const approved = await svc.processPayout(p.id, 'approve');
    expect(approved.status).toBe('approved');
    const paid = await svc.processPayout(p.id, 'mark-paid');
    expect(paid.status).toBe('paid');
  });

  it('金額 <= 0 → throw', async () => {
    const svc = new InstructorService(new InMemoryInstructorStore());
    await expect(
      svc.requestPayout({
        tenantId: TENANT, instructorId: INSTRUCTOR, amountMinor: 0,
        method: 'wise', payeeRef: 'x',
      }),
    ).rejects.toThrow(/大於 0/);
  });

  it('拒絕需要 reason', async () => {
    const svc = new InstructorService(new InMemoryInstructorStore());
    const p = await svc.requestPayout({
      tenantId: TENANT, instructorId: INSTRUCTOR, amountMinor: 50000,
      method: 'wise', payeeRef: 'x',
    });
    const rejected = await svc.processPayout(p.id, 'reject', { rejectionReason: '發票未附' });
    expect(rejected.status).toBe('rejected');
    expect(rejected.rejectionReason).toBe('發票未附');
  });
});

describe('InstructorService DM', () => {
  it('雙方訊息歸入同一 conversation 並依時間排序', async () => {
    const svc = new InstructorService(new InMemoryInstructorStore());
    await svc.sendDm({
      tenantId: TENANT, fromUserId: 'A', toUserId: 'B', fromRole: 'instructor',
      body: 'hi', now: new Date('2026-05-15T10:00:00Z'),
    });
    await svc.sendDm({
      tenantId: TENANT, fromUserId: 'B', toUserId: 'A', fromRole: 'learner',
      body: 'hello', now: new Date('2026-05-15T10:01:00Z'),
    });
    const list = await svc.listConversation('A', 'B');
    expect(list.map((m) => m.body)).toEqual(['hi', 'hello']);
    expect(list[0]?.conversationId).toBe(list[1]?.conversationId);
  });

  it('空訊息 → throw', async () => {
    const svc = new InstructorService(new InMemoryInstructorStore());
    await expect(
      svc.sendDm({
        tenantId: TENANT, fromUserId: 'A', toUserId: 'B', fromRole: 'instructor', body: '   ',
      }),
    ).rejects.toThrow(/不可為空/);
  });
});

describe('InstructorService 內容版本管理', () => {
  it('publishContentVersion 自動遞增版本', async () => {
    const svc = new InstructorService(new InMemoryInstructorStore());
    const v1 = await svc.publishContentVersion({
      tenantId: TENANT, courseId: COURSE, lessonSnapshots: { l1: 'snap-1' },
    });
    const v2 = await svc.publishContentVersion({
      tenantId: TENANT, courseId: COURSE, lessonSnapshots: { l1: 'snap-2' },
      changelog: '重拍 L1',
    });
    expect(v1.version).toBe(1);
    expect(v2.version).toBe(2);
  });

  it('已購學員鎖在舊版，新版不影響', async () => {
    const svc = new InstructorService(new InMemoryInstructorStore());
    await svc.publishContentVersion({ tenantId: TENANT, courseId: COURSE, lessonSnapshots: { l1: 'snap-1' } });
    const lock = await svc.lockEnrollmentToLatest('enr-1', COURSE);
    expect(lock.lockedVersion).toBe(1);
    await svc.publishContentVersion({ tenantId: TENANT, courseId: COURSE, lessonSnapshots: { l1: 'snap-2' } });
    const v = await svc.resolveVersionForEnrollment('enr-1');
    expect(v.version).toBe(1);
    expect(v.lessonSnapshots.l1).toBe('snap-1');
  });

  it('optInLatest → 切到最新版', async () => {
    const svc = new InstructorService(new InMemoryInstructorStore());
    await svc.publishContentVersion({ tenantId: TENANT, courseId: COURSE, lessonSnapshots: { l1: 's1' } });
    await svc.lockEnrollmentToLatest('enr-1', COURSE);
    await svc.publishContentVersion({ tenantId: TENANT, courseId: COURSE, lessonSnapshots: { l1: 's2' } });
    await svc.optInLatestVersion('enr-1');
    const v = await svc.resolveVersionForEnrollment('enr-1');
    expect(v.version).toBe(2);
  });
});
