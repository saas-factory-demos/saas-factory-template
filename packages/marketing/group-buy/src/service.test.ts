import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  InMemoryGroupBuyDealStore,
  InMemoryGroupBuyOrderStore,
} from './in-memory-store.js';
import { GroupBuyService, type RefundHandler, type SuccessNotifier } from './service.js';

const DAY = 24 * 60 * 60 * 1000;

describe('GroupBuyService', () => {
  let deals: InMemoryGroupBuyDealStore;
  let orders: InMemoryGroupBuyOrderStore;
  let service: GroupBuyService;
  let refund: ReturnType<typeof vi.fn<RefundHandler>>;
  let notify: ReturnType<typeof vi.fn<SuccessNotifier>>;
  let counter = 0;
  const now = new Date('2026-05-15T00:00:00Z');

  beforeEach(() => {
    deals = new InMemoryGroupBuyDealStore();
    orders = new InMemoryGroupBuyOrderStore();
    refund = vi.fn<RefundHandler>(async () => ({ ok: true }));
    notify = vi.fn<SuccessNotifier>(async () => undefined);
    counter = 0;
    service = new GroupBuyService(
      deals,
      orders,
      { refund, notify },
      { now: () => now, genId: () => `id_${++counter}` },
    );
  });

  it('createDeal 拒絕 deadline 已過 / minMembers < 2', async () => {
    await expect(
      service.createDeal({
        tenantId: 't1',
        productId: 'p1',
        name: '',
        minMembers: 3,
        unitPriceMinor: 1000,
        deadlineAt: new Date(now.getTime() - DAY),
      }),
    ).rejects.toThrow('deadlineAt');

    await expect(
      service.createDeal({
        tenantId: 't1',
        productId: 'p1',
        name: '',
        minMembers: 1,
        unitPriceMinor: 1000,
        deadlineAt: new Date(now.getTime() + DAY),
      }),
    ).rejects.toThrow('minMembers');
  });

  it('join 第 N 人達門檻立即成團 + notify', async () => {
    const d = await service.createDeal({
      tenantId: 't1',
      productId: 'p1',
      name: '團',
      minMembers: 3,
      unitPriceMinor: 1000,
      deadlineAt: new Date(now.getTime() + DAY),
    });
    await service.join({ dealId: d.id, customerId: 'c1', paymentOrderId: 'pay1', at: now });
    await service.join({ dealId: d.id, customerId: 'c2', paymentOrderId: 'pay2', at: now });
    expect((await deals.findById(d.id))?.status).toBe('open');
    await service.join({ dealId: d.id, customerId: 'c3', paymentOrderId: 'pay3', at: now });
    const after = await deals.findById(d.id);
    expect(after?.status).toBe('succeeded');
    expect(notify).toHaveBeenCalledTimes(1);
    const list = await orders.listByDeal(d.id);
    expect(list.every((o) => o.status === 'confirmed')).toBe(true);
  });

  it('settleDue 未達門檻全退 + 標記 failed', async () => {
    const d = await service.createDeal({
      tenantId: 't1',
      productId: 'p1',
      name: '',
      minMembers: 5,
      unitPriceMinor: 1000,
      deadlineAt: new Date(now.getTime() + DAY),
    });
    await service.join({ dealId: d.id, customerId: 'c1', paymentOrderId: 'pay1', at: now });
    await service.join({ dealId: d.id, customerId: 'c2', paymentOrderId: 'pay2', at: now });

    const later = new Date(d.deadlineAt.getTime() + 60_000);
    // 模擬 cron 在 later 跑
    service = new GroupBuyService(
      deals,
      orders,
      { refund, notify },
      { now: () => later, genId: () => `idL_${++counter}` },
    );
    const results = await service.settleDue('t1');
    expect(results).toHaveLength(1);
    expect(results[0]?.outcome).toBe('failed');
    expect(results[0]?.totalMembers).toBe(2);
    expect(refund).toHaveBeenCalledTimes(2);
    const after = await deals.findById(d.id);
    expect(after?.status).toBe('failed');
  });

  it('join 同客戶重複報名被拒', async () => {
    const d = await service.createDeal({
      tenantId: 't1',
      productId: 'p1',
      name: '',
      minMembers: 5,
      unitPriceMinor: 1000,
      deadlineAt: new Date(now.getTime() + DAY),
    });
    await service.join({ dealId: d.id, customerId: 'c1', paymentOrderId: 'pay1', at: now });
    await expect(
      service.join({ dealId: d.id, customerId: 'c1', paymentOrderId: 'pay2', at: now }),
    ).rejects.toThrow('已報名過');
  });

  it('cancelJoin 截止前可退', async () => {
    const d = await service.createDeal({
      tenantId: 't1',
      productId: 'p1',
      name: '',
      minMembers: 5,
      unitPriceMinor: 1000,
      deadlineAt: new Date(now.getTime() + DAY),
    });
    const o = await service.join({
      dealId: d.id,
      customerId: 'c1',
      paymentOrderId: 'pay1',
      at: now,
    });
    const cancelled = await service.cancelJoin(o.id);
    expect(cancelled.status).toBe('cancelled');
    expect(refund).toHaveBeenCalledTimes(1);
  });

  it('maxMembers 額滿拒絕後續報名', async () => {
    const d = await service.createDeal({
      tenantId: 't1',
      productId: 'p1',
      name: '',
      minMembers: 2,
      maxMembers: 2,
      unitPriceMinor: 1000,
      deadlineAt: new Date(now.getTime() + DAY),
    });
    await service.join({ dealId: d.id, customerId: 'c1', paymentOrderId: 'pay1', at: now });
    await service.join({ dealId: d.id, customerId: 'c2', paymentOrderId: 'pay2', at: now });
    // 第二人入即成團，status=succeeded
    await expect(
      service.join({ dealId: d.id, customerId: 'c3', paymentOrderId: 'pay3', at: now }),
    ).rejects.toThrow('deal 已 succeeded');
  });
});
