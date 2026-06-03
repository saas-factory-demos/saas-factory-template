import { describe, expect, it, vi } from 'vitest';

import { InMemoryPointsStore } from './in-memory-store.js';
import { PointsService } from './service.js';

describe('PointsService', () => {
  it('訂單賺點寫入 batch + ledger + emit', async () => {
    const store = new InMemoryPointsStore();
    const emit = vi.fn();
    const service = new PointsService(store, {
      emit,
      earnRule: { spendPerPoint: 100, expiryDays: 365 },
    });
    const result = await service.earnFromOrder({
      userId: 'u1',
      tenantId: 't1',
      spendAmount: 5500,
      orderId: 'o1',
    });
    expect(result.points).toBe(55);
    expect(await service.getBalance('u1', 't1')).toBe(55);
    expect(store.ledger).toHaveLength(1);
    expect(store.ledger[0]!.kind).toBe('earn');
    expect(emit).toHaveBeenCalledWith(expect.objectContaining({ type: 'points.earned' }));
  });

  it('FIFO 扣點優先扣最早到期的批次', async () => {
    const store = new InMemoryPointsStore();
    const service = new PointsService(store, {
      earnRule: { spendPerPoint: 100, expiryDays: 30 },
      redeemRule: { pointsPerCurrency: 1 },
      now: () => new Date('2026-05-15T00:00:00Z'),
    });
    await store.saveBatch({
      id: 'b1',
      userId: 'u1',
      tenantId: 't1',
      amount: 50,
      consumed: 0,
      earnedAt: '2026-04-01T00:00:00Z',
      expiresAt: '2026-06-01T00:00:00Z',
      source: 'order',
      expired: false,
    });
    await store.saveBatch({
      id: 'b2',
      userId: 'u1',
      tenantId: 't1',
      amount: 80,
      consumed: 0,
      earnedAt: '2026-05-01T00:00:00Z',
      expiresAt: '2026-07-01T00:00:00Z',
      source: 'order',
      expired: false,
    });
    const result = await service.redeem({ userId: 'u1', tenantId: 't1', points: 60 });
    expect(result.ok).toBe(true);
    expect(result.discountAmount).toBe(60);
    expect(store.batches.get('b1')!.consumed).toBe(50);
    expect(store.batches.get('b2')!.consumed).toBe(10);
  });

  it('用點餘額不足回 insufficient', async () => {
    const store = new InMemoryPointsStore();
    const service = new PointsService(store, {
      redeemRule: { pointsPerCurrency: 1 },
    });
    const result = await service.redeem({ userId: 'u1', tenantId: 't1', points: 100 });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('insufficient');
  });

  it('sweepExpired 把過期批次清零並 emit', async () => {
    const store = new InMemoryPointsStore();
    const emit = vi.fn();
    const service = new PointsService(store, {
      emit,
      now: () => new Date('2026-05-15T00:00:00Z'),
    });
    await store.saveBatch({
      id: 'b1',
      userId: 'u1',
      tenantId: 't1',
      amount: 100,
      consumed: 20,
      earnedAt: '2025-01-01T00:00:00Z',
      expiresAt: '2026-01-01T00:00:00Z',
      source: 'order',
      expired: false,
    });
    const result = await service.sweepExpired('u1', 't1');
    expect(result.expiredTotal).toBe(80);
    expect(store.batches.get('b1')!.expired).toBe(true);
    expect(emit).toHaveBeenCalledWith(expect.objectContaining({ type: 'points.expired' }));
  });

  it('manual-add 寫新批次', async () => {
    const store = new InMemoryPointsStore();
    const service = new PointsService(store);
    await service.manualAdjust({
      userId: 'u1',
      tenantId: 't1',
      delta: 200,
      operatorUserId: 'admin-1',
      reason: '客訴補償',
    });
    expect(await service.getBalance('u1', 't1')).toBe(200);
    expect(store.ledger[0]!.kind).toBe('manual-add');
  });

  it('manual-deduct 走 FIFO 扣', async () => {
    const store = new InMemoryPointsStore();
    const service = new PointsService(store);
    await store.saveBatch({
      id: 'b1',
      userId: 'u1',
      tenantId: 't1',
      amount: 100,
      consumed: 0,
      earnedAt: '2026-01-01T00:00:00Z',
      expiresAt: null,
      source: 'order',
      expired: false,
    });
    await service.manualAdjust({
      userId: 'u1',
      tenantId: 't1',
      delta: -30,
      operatorUserId: 'admin-1',
    });
    expect(await service.getBalance('u1', 't1')).toBe(70);
    expect(store.ledger[0]!.kind).toBe('manual-deduct');
  });

  it('redeem 超過 maxRedeemAmount 拒絕', async () => {
    const store = new InMemoryPointsStore();
    const service = new PointsService(store, {
      redeemRule: { pointsPerCurrency: 1, maxRedeemAmount: 50 },
    });
    await store.saveBatch({
      id: 'b1',
      userId: 'u1',
      tenantId: 't1',
      amount: 1000,
      consumed: 0,
      earnedAt: '2026-01-01T00:00:00Z',
      expiresAt: null,
      source: 'order',
      expired: false,
    });
    const result = await service.redeem({ userId: 'u1', tenantId: 't1', points: 100 });
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('over-limit');
  });
});
