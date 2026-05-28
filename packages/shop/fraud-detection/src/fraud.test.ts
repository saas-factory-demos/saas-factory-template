import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryFraudStore } from './in-memory-store.js';
import { FraudDetectionService } from './service.js';

import type { OrderRecord } from './types.js';

const TENANT = 'tenant-1';

function makeOrder(partial: Partial<OrderRecord> & { id: string }): OrderRecord {
  return {
    id: partial.id,
    tenantId: TENANT,
    amount: partial.amount ?? 1000,
    createdAt: partial.createdAt ?? new Date(),
    userId: partial.userId,
    email: partial.email,
    phone: partial.phone,
    ip: partial.ip,
    cardHash: partial.cardHash,
    shippingAddress: partial.shippingAddress,
    rejected: partial.rejected,
  };
}

describe('FraudDetectionService', () => {
  let store: InMemoryFraudStore;
  let service: FraudDetectionService;

  beforeEach(() => {
    store = new InMemoryFraudStore();
    service = new FraudDetectionService(store);
  });

  it('全部訊號未觸發 → allow', async () => {
    const r = await service.check({
      tenantId: TENANT,
      email: 'a@b.com',
      ip: '1.1.1.1',
      amount: 500,
    });
    expect(r.action).toBe('allow');
    expect(r.riskScore).toBe(0);
    expect(r.signals).toHaveLength(0);
  });

  it('黑名單命中（email）→ block + signal', async () => {
    await service.addBlacklist({
      tenantId: TENANT,
      kind: 'email',
      value: 'bad@x.com',
      reason: '退款黑單',
    });
    const r = await service.check({ tenantId: TENANT, email: 'bad@x.com', amount: 100 });
    expect(r.action).toBe('block');
    expect(r.signals.some((s) => s.kind === 'blacklist-email')).toBe(true);
  });

  it('黑名單已過期 → 不觸發', async () => {
    const yesterday = new Date('2026-05-14T00:00:00Z');
    await service.addBlacklist({
      tenantId: TENANT,
      kind: 'ip',
      value: '9.9.9.9',
      expiresAt: yesterday,
    });
    const r = await service.check({
      tenantId: TENANT,
      ip: '9.9.9.9',
      amount: 100,
      now: new Date('2026-05-15T00:00:00Z'),
    });
    expect(r.action).toBe('allow');
  });

  it('同 IP 短時間多筆 → ip-velocity 觸發', async () => {
    const now = new Date('2026-05-15T10:00:00Z');
    const earlier = new Date(now.getTime() - 5 * 60_000);
    // 預先寫入 3 筆同 IP 訂單
    for (let i = 0; i < 3; i++) {
      await store.recordOrder(makeOrder({ id: `o-${i}`, ip: '5.5.5.5', createdAt: earlier }));
    }
    const r = await service.check({
      tenantId: TENANT,
      ip: '5.5.5.5',
      amount: 1000,
      now,
    });
    expect(r.signals.some((s) => s.kind === 'ip-velocity')).toBe(true);
    expect(r.action).toBe('review');
  });

  it('收件地址多樣性過高 → address-diversity 觸發', async () => {
    const now = new Date('2026-05-15T10:00:00Z');
    const earlier = new Date(now.getTime() - 7 * 86_400_000);
    for (const addr of ['A', 'B', 'C']) {
      await store.recordOrder(
        makeOrder({
          id: `o-${addr}`,
          email: 'c@x.com',
          shippingAddress: addr,
          createdAt: earlier,
        }),
      );
    }
    const r = await service.check({
      tenantId: TENANT,
      email: 'c@x.com',
      shippingAddress: 'D',
      amount: 100,
      now,
    });
    expect(r.signals.some((s) => s.kind === 'address-diversity')).toBe(true);
  });

  it('高金額 → high-amount 觸發', async () => {
    const r = await service.check({ tenantId: TENANT, email: 'a@b.com', amount: 80_000 });
    expect(r.signals.some((s) => s.kind === 'high-amount')).toBe(true);
    // 30 分 → review
    expect(r.action).toBe('review');
  });

  it('多訊號累加 → block', async () => {
    await service.addBlacklist({ tenantId: TENANT, kind: 'phone', value: '0900-000-000' });
    const r = await service.check({
      tenantId: TENANT,
      phone: '0900-000-000',
      amount: 90_000,
    });
    expect(r.action).toBe('block');
    expect(r.signals.length).toBeGreaterThanOrEqual(2);
  });

  it('客戶高拒收率 → high-rejection-rate 觸發 + 風險標記更新', async () => {
    const email = 'reject@x.com';
    for (let i = 0; i < 5; i++) {
      await service.recordOrder(
        makeOrder({ id: `r-${i}`, email, createdAt: new Date('2026-05-01T00:00:00Z') }),
      );
    }
    // 5 筆中 3 筆拒收 → 60%
    for (const id of ['r-0', 'r-1', 'r-2']) {
      await service.markOrderRejected(TENANT, id, { email });
    }
    const r = await service.check({ tenantId: TENANT, email, amount: 500 });
    expect(r.signals.some((s) => s.kind === 'high-rejection-rate')).toBe(true);
  });
});
