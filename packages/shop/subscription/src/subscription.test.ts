import { describe, expect, it, vi } from 'vitest';

import { InMemorySubscriptionStore } from './in-memory-store.js';
import { SubscriptionService } from './service.js';

function makeService(now = new Date('2026-05-15T00:00:00Z')) {
  const store = new InMemorySubscriptionStore();
  const emit = vi.fn();
  const service = new SubscriptionService(store, { emit, now: () => now, maxFailureRetries: 2 });
  return { store, emit, service, now };
}

describe('SubscriptionService', () => {
  it('建立訂閱排定 nextRunAt 並 emit', async () => {
    const { service, emit } = makeService();
    const sub = await service.create({
      tenantId: 't1',
      userId: 'u1',
      items: [{ variantId: 'v1', productId: 'p1', quantity: 1, unitPrice: 1000 }],
      frequency: 'monthly',
      shippingAddress: { name: 'A', phone: '0900', address: '台北' },
      paymentToken: 'tok-1',
      cardExpiresAt: '2027-01',
    });
    expect(sub.status).toBe('active');
    expect(emit).toHaveBeenCalledWith(expect.objectContaining({ type: 'subscription.created' }));
  });

  it('暫停 + 恢復', async () => {
    const { service, emit } = makeService();
    const sub = await service.create({
      tenantId: 't1',
      userId: 'u1',
      items: [],
      frequency: 'weekly',
      shippingAddress: { name: 'A', phone: '0900', address: '台北' },
      paymentToken: 'tok',
      cardExpiresAt: '2027-12',
    });
    await service.pause(sub.id);
    const resumed = await service.resume(sub.id);
    expect(resumed.status).toBe('active');
    expect(emit).toHaveBeenCalledWith(expect.objectContaining({ type: 'subscription.paused' }));
    expect(emit).toHaveBeenCalledWith(expect.objectContaining({ type: 'subscription.resumed' }));
  });

  it('processDueRenewals 成功時推進 nextRunAt', async () => {
    const { store, service } = makeService();
    const sub = await service.create({
      tenantId: 't1',
      userId: 'u1',
      items: [],
      frequency: 'weekly',
      shippingAddress: { name: 'A', phone: '0900', address: '台北' },
      paymentToken: 'tok',
      cardExpiresAt: '2027-12',
    });
    // 強制設為到期。
    sub.nextRunAt = '2026-05-14T00:00:00Z';
    await store.save(sub);

    const executor = vi.fn().mockResolvedValue({ ok: true, orderId: 'order-renew-1' });
    const result = await service.processDueRenewals('t1', executor);
    expect(result.succeeded).toBe(1);
    const updated = await store.get(sub.id);
    expect(updated?.lastOrderId).toBe('order-renew-1');
  });

  it('連續失敗達上限後取消', async () => {
    const { store, service } = makeService();
    const sub = await service.create({
      tenantId: 't1',
      userId: 'u1',
      items: [],
      frequency: 'weekly',
      shippingAddress: { name: 'A', phone: '0900', address: '台北' },
      paymentToken: 'tok',
      cardExpiresAt: '2027-12',
    });
    sub.nextRunAt = '2026-05-14T00:00:00Z';
    await store.save(sub);

    const executor = vi.fn().mockResolvedValue({ ok: false, reason: 'card declined' });
    await service.processDueRenewals('t1', executor);
    sub.nextRunAt = '2026-05-14T00:00:00Z';
    await store.save(sub);
    await service.processDueRenewals('t1', executor);
    const updated = await store.get(sub.id);
    expect(updated?.status).toBe('cancelled');
  });

  it('skipNext 把 nextRunAt 順延一週期', async () => {
    const { store, service } = makeService();
    const sub = await service.create({
      tenantId: 't1',
      userId: 'u1',
      items: [],
      frequency: 'weekly',
      shippingAddress: { name: 'A', phone: '0900', address: '台北' },
      paymentToken: 'tok',
      cardExpiresAt: '2027-12',
    });
    const oldNext = sub.nextRunAt;
    await service.skipNext(sub.id);
    const updated = await store.get(sub.id);
    expect(updated!.nextRunAt > oldNext).toBe(true);
  });
});
