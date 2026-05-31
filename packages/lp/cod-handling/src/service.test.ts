import { beforeEach, describe, expect, it } from 'vitest';

import {
  InMemoryCodBlacklistStore,
  InMemoryCodOrderStore,
} from './in-memory-store.js';
import { LpCodService } from './service.js';

import type { CodOrder } from './types.js';

const tenantId = 'tenant-1';
const pageId = 'page-1';

function makeService(opts?: { maxRejections?: number }) {
  const orders = new InMemoryCodOrderStore();
  const blacklist = new InMemoryCodBlacklistStore();
  let counter = 0;
  const svc = new LpCodService(
    orders,
    blacklist,
    { maxRejectionsBeforeBlacklist: opts?.maxRejections ?? 2 },
    {
      now: () => new Date('2026-05-15T00:00:00Z'),
      genId: () => `cod_${++counter}`,
    },
  );
  return { svc, orders, blacklist };
}

async function createBasicOrder(svc: LpCodService, phone = '0912345678'): Promise<CodOrder> {
  return svc.createOrder({
    tenantId,
    pageId,
    draftId: 'draft-1',
    customer: { name: '王小明', phone },
    channel: 'convenience-store',
    totalMinor: 99000,
  });
}

describe('LpCodService', () => {
  let svc: LpCodService;
  let blacklist: InMemoryCodBlacklistStore;

  beforeEach(() => {
    const built = makeService();
    svc = built.svc;
    blacklist = built.blacklist;
  });

  it('建立 COD 訂單為 pending-confirm', async () => {
    const o = await createBasicOrder(svc);
    expect(o.status).toBe('pending-confirm');
    expect(o.followUp).toBe('queued');
    expect(o.attempts).toBe(0);
  });

  it('黑名單客戶不可下單', async () => {
    await blacklist.upsert({
      tenantId,
      phone: '0911111111',
      rejectionCount: 2,
      blacklistedAt: new Date(),
      history: [],
    });
    await expect(createBasicOrder(svc, '0911111111')).rejects.toThrow('黑名單');
  });

  it('正常流程：pending-confirm → confirmed → shipped → delivered', async () => {
    const o = await createBasicOrder(svc);
    await svc.attemptFollowUp(o.id);
    const confirmed = await svc.confirm(o.id);
    expect(confirmed.status).toBe('confirmed');
    const shipped = await svc.markShipped(o.id);
    expect(shipped.status).toBe('shipped');
    const delivered = await svc.markDelivered(o.id);
    expect(delivered.status).toBe('delivered');
  });

  it('跟催累計 attempts，達 3 次自動取消', async () => {
    const o = await createBasicOrder(svc);
    await svc.attemptFollowUp(o.id);
    await svc.attemptFollowUp(o.id);
    await svc.attemptFollowUp(o.id);
    const updated = await svc.markUnreachable(o.id);
    expect(updated.status).toBe('cancelled');
    expect(updated.followUp).toBe('cancelled');
  });

  it('attempts 未滿 3 時，markUnreachable 標 unreachable 而不取消', async () => {
    const o = await createBasicOrder(svc);
    await svc.attemptFollowUp(o.id);
    const updated = await svc.markUnreachable(o.id);
    expect(updated.status).toBe('pending-confirm');
    expect(updated.followUp).toBe('unreachable');
  });

  it('非法狀態切換會 throw', async () => {
    const o = await createBasicOrder(svc);
    await expect(svc.markShipped(o.id)).rejects.toThrow('confirmed');
    await svc.confirm(o.id);
    await expect(svc.markDelivered(o.id)).rejects.toThrow('shipped');
  });

  it('已 delivered 不可取消', async () => {
    const o = await createBasicOrder(svc);
    await svc.confirm(o.id);
    await svc.markShipped(o.id);
    await svc.markDelivered(o.id);
    await expect(svc.cancel(o.id, '測試')).rejects.toThrow('已結案');
  });

  it('第 1 次拒收只計數不擋下單，第 2 次達門檻才阻擋', async () => {
    const o1 = await createBasicOrder(svc);
    await svc.confirm(o1.id);
    await svc.markShipped(o1.id);
    await svc.markRejected(o1.id, '客戶反悔');

    const afterFirst = await svc.checkBlacklist(tenantId, '0912345678');
    expect(afterFirst?.rejectionCount).toBe(1);

    // 第 1 次拒收後還能下單（count 未達門檻 2）
    const o2 = await createBasicOrder(svc);
    await svc.confirm(o2.id);
    await svc.markShipped(o2.id);
    await svc.markRejected(o2.id, '人不在');

    const banned = await svc.checkBlacklist(tenantId, '0912345678');
    expect(banned?.rejectionCount).toBe(2);
    expect(banned?.history).toHaveLength(2);

    // 達門檻後再下單會被擋
    await expect(createBasicOrder(svc)).rejects.toThrow('黑名單');
  });

  it('rejectionStats 分母為 delivered + rejected', async () => {
    const a = await createBasicOrder(svc, '0911000001');
    await svc.confirm(a.id);
    await svc.markShipped(a.id);
    await svc.markDelivered(a.id);

    const b = await createBasicOrder(svc, '0911000002');
    await svc.confirm(b.id);
    await svc.markShipped(b.id);
    await svc.markRejected(b.id, '拒收');

    const c = await createBasicOrder(svc, '0911000003');
    await svc.confirm(c.id);
    await svc.markShipped(c.id);

    const stats = await svc.rejectionStats(tenantId);
    expect(stats.totalDeliveryAttempted).toBe(2);
    expect(stats.rejectedCount).toBe(1);
    expect(stats.rejectionRate).toBe(0.5);
  });

  it('rejectionStats 無資料時回 0', async () => {
    const stats = await svc.rejectionStats(tenantId);
    expect(stats.totalDeliveryAttempted).toBe(0);
    expect(stats.rejectionRate).toBe(0);
  });

  it('velocity：同 phone 60 分鐘內第 4 張 COD → throw', async () => {
    // 預設 velocityMaxOrders = 3
    await createBasicOrder(svc, '0933333333');
    await createBasicOrder(svc, '0933333333');
    await createBasicOrder(svc, '0933333333');
    await expect(createBasicOrder(svc, '0933333333')).rejects.toThrow(/COD 訂單/);
  });

  it('velocity：不同 phone 不互算', async () => {
    await createBasicOrder(svc, '0944000001');
    await createBasicOrder(svc, '0944000001');
    await createBasicOrder(svc, '0944000001');
    await expect(createBasicOrder(svc, '0944000002')).resolves.toBeDefined();
  });

  it('velocity：時窗外不算', async () => {
    let nowVal = new Date('2026-05-15T00:00:00Z').getTime();
    const orders = new InMemoryCodOrderStore();
    const blacklist = new InMemoryCodBlacklistStore();
    let n = 0;
    const svc2 = new LpCodService(
      orders,
      blacklist,
      { maxRejectionsBeforeBlacklist: 99, velocityMaxOrders: 2, velocityWindowMinutes: 10 },
      { now: () => new Date(nowVal), genId: () => `cod_${++n}` },
    );
    await svc2.createOrder({
      tenantId,
      pageId,
      draftId: 'd',
      customer: { name: 'A', phone: '0955000001' },
      channel: 'convenience-store',
      totalMinor: 10000,
    });
    await svc2.createOrder({
      tenantId,
      pageId,
      draftId: 'd',
      customer: { name: 'A', phone: '0955000001' },
      channel: 'convenience-store',
      totalMinor: 10000,
    });
    // 跳出時窗
    nowVal += 11 * 60_000;
    await expect(
      svc2.createOrder({
        tenantId,
        pageId,
        draftId: 'd',
        customer: { name: 'A', phone: '0955000001' },
        channel: 'convenience-store',
        totalMinor: 10000,
      }),
    ).resolves.toBeDefined();
  });

  it('門檻設為 1 時，首次拒收即進黑名單', async () => {
    const built = makeService({ maxRejections: 1 });
    const o = await createBasicOrder(built.svc, '0922222222');
    await built.svc.confirm(o.id);
    await built.svc.markShipped(o.id);
    await built.svc.markRejected(o.id, '一次就 ban');
    const banned = await built.svc.checkBlacklist(tenantId, '0922222222');
    expect(banned?.rejectionCount).toBe(1);
  });
});
