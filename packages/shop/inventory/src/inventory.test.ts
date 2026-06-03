import { describe, expect, it, vi } from 'vitest';

import { InMemoryInventoryStore } from './in-memory-store.js';
import { InventoryService } from './service.js';

import type { InventoryItem, InventoryReservation } from './types.js';

function setup(items: InventoryItem[]): InventoryService {
  const store = new InMemoryInventoryStore();
  for (const item of items) store.addItem(item);
  return new InventoryService({ store, now: () => 1_000_000 });
}

const ITEM: InventoryItem = {
  id: 'i1',
  tenantId: 't1',
  variantId: 'v1',
  warehouseId: 'w1',
  onHand: 10,
  reserved: 0,
  safetyStock: 2,
  version: 0,
};

describe('InventoryService.reserve', () => {
  it('庫存足夠 → success', async () => {
    const svc = setup([ITEM]);
    const r = await svc.reserve({
      tenantId: 't1',
      orderId: 'o1',
      items: [{ variantId: 'v1', quantity: 3 }],
    });
    expect(r.success).toBe(true);
    expect(r.reservations).toHaveLength(1);
    expect(r.reservations[0]!.quantity).toBe(3);
  });

  it('庫存不足 → insufficient', async () => {
    const svc = setup([ITEM]);
    const r = await svc.reserve({
      tenantId: 't1',
      orderId: 'o1',
      items: [{ variantId: 'v1', quantity: 99 }],
    });
    expect(r.success).toBe(false);
    expect(r.insufficient).toEqual([
      { variantId: 'v1', requested: 99, available: 10 },
    ]);
  });

  it('預扣後 reserved 增加', async () => {
    const store = new InMemoryInventoryStore();
    store.addItem(ITEM);
    const svc = new InventoryService({ store, now: () => 1000 });
    await svc.reserve({
      tenantId: 't1',
      orderId: 'o1',
      items: [{ variantId: 'v1', quantity: 4 }],
    });
    const after = await store.getItem('v1', 'w1');
    expect(after?.reserved).toBe(4);
  });

  it('多倉庫合扣（priority 順序）', async () => {
    const svc = setup([
      { ...ITEM, id: 'i1', warehouseId: 'w1', onHand: 3 },
      { ...ITEM, id: 'i2', warehouseId: 'w2', onHand: 5 },
    ]);
    const r = await svc.reserve({
      tenantId: 't1',
      orderId: 'o1',
      items: [{ variantId: 'v1', quantity: 6 }],
    });
    expect(r.success).toBe(true);
    expect(r.reservations).toHaveLength(2);
    expect(r.reservations[0]!.quantity).toBe(3);
    expect(r.reservations[1]!.quantity).toBe(3);
  });
});

describe('InventoryService.reserve (CAS)', () => {
  it('版本衝突會重試並最終成功', async () => {
    const store = new InMemoryInventoryStore();
    store.addItem({ ...ITEM, onHand: 10 });
    const svc = new InventoryService({ store, now: () => 1000 });

    // 在第一次 reserve 寫入前，先製造一次版本變動。
    const original = store.updateItem.bind(store);
    let bumped = false;
    store.updateItem = async (id, patch, expected) => {
      if (!bumped && expected !== undefined) {
        bumped = true;
        // 直接無鎖寫入一次，讓 expected version 對不上，觸發衝突。
        await original(id, { reserved: 1 });
        return original(id, patch, expected);
      }
      return original(id, patch, expected);
    };

    const r = await svc.reserve({
      tenantId: 't1',
      orderId: 'o1',
      items: [{ variantId: 'v1', quantity: 2 }],
    });
    expect(r.success).toBe(true);
    const after = await store.getItem('v1', 'w1');
    // 最終 reserved = 上次干擾的 1 + 本次 reserve 的 2 = 3。
    expect(after?.reserved).toBe(3);
  });
});

describe('InventoryService.consume', () => {
  it('付款後扣 onHand + 觸發低庫存', async () => {
    const store = new InMemoryInventoryStore();
    store.addItem({ ...ITEM, onHand: 5, reserved: 5, safetyStock: 2 });
    const lowStock = vi.fn();
    const svc = new InventoryService({ store, onLowStock: lowStock });
    const rsv: InventoryReservation = {
      id: 'r1',
      tenantId: 't1',
      variantId: 'v1',
      warehouseId: 'w1',
      quantity: 4,
      orderId: 'o1',
      createdAt: 0,
      expiresAt: 999,
      status: 'held',
    };
    await store.createReservation(rsv);
    await svc.consume(rsv);
    const after = await store.getItem('v1', 'w1');
    expect(after?.onHand).toBe(1);
    expect(lowStock).toHaveBeenCalledOnce();
  });
});

describe('InventoryService.release / sweepExpired', () => {
  it('釋放降 reserved', async () => {
    const store = new InMemoryInventoryStore();
    store.addItem({ ...ITEM, reserved: 3 });
    const svc = new InventoryService({ store });
    const rsv: InventoryReservation = {
      id: 'r1',
      tenantId: 't1',
      variantId: 'v1',
      warehouseId: 'w1',
      quantity: 3,
      orderId: 'o1',
      createdAt: 0,
      expiresAt: 999,
      status: 'held',
    };
    await store.createReservation(rsv);
    await svc.release(rsv);
    const after = await store.getItem('v1', 'w1');
    expect(after?.reserved).toBe(0);
  });

  it('sweepExpired 自動釋放過期', async () => {
    const store = new InMemoryInventoryStore();
    store.addItem({ ...ITEM, reserved: 5 });
    const svc = new InventoryService({ store, now: () => 10_000 });
    await store.createReservation({
      id: 'r1',
      tenantId: 't1',
      variantId: 'v1',
      warehouseId: 'w1',
      quantity: 5,
      orderId: 'o1',
      createdAt: 0,
      expiresAt: 9_000,
      status: 'held',
    });
    const swept = await svc.sweepExpired();
    expect(swept).toBe(1);
    const after = await store.getItem('v1', 'w1');
    expect(after?.reserved).toBe(0);
  });
});
