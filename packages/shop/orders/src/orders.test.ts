import { describe, expect, it, vi } from 'vitest';

import { generateOrderNumber, parseOrderNumber } from './order-number.js';
import { OrderService } from './service.js';
import { canTransition, isTerminal, nextStates } from './state-machine.js';

import type { Order } from './types.js';
import type { DomainEvent } from '@saas-factory/events';

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'o1',
    tenantId: 't1',
    orderNumber: '20260515-0001',
    userId: 'u1',
    status: 'draft',
    items: [
      {
        productId: 'p1',
        variantId: 'v1',
        sku: 'SKU-1',
        title: '測試商品',
        unitPrice: 100,
        quantity: 2,
      },
    ],
    currency: 'TWD',
    subtotal: 200,
    discountTotal: 0,
    shippingFee: 60,
    taxAmount: 0,
    total: 260,
    marketingOptIn: false,
    isPreOrder: false,
    statusHistory: [{ from: null, to: 'draft', at: '2026-05-15T00:00:00.000Z' }],
    createdAt: '2026-05-15T00:00:00.000Z',
    updatedAt: '2026-05-15T00:00:00.000Z',
    ...overrides,
  };
}

describe('generateOrderNumber', () => {
  it('產生 YYYYMMDD-NNNN-XXXX 格式（預設帶隨機後綴）', () => {
    const n = generateOrderNumber(1, { now: () => new Date('2026-05-15T10:00:00Z') });
    expect(n).toMatch(/^\d{8}-\d{4}-[A-Z0-9]{4}$/);
  });

  it('關閉隨機後綴可回到 YYYYMMDD-NNNN 格式', () => {
    const n = generateOrderNumber(1, {
      now: () => new Date('2026-05-15T10:00:00Z'),
      randomSuffixLength: 0,
    });
    expect(n).toMatch(/^\d{8}-\d{4}$/);
  });

  it('padding 4 位', () => {
    const n = generateOrderNumber(42, {
      now: () => new Date('2026-05-15T10:00:00Z'),
      randomSuffixLength: 0,
    });
    expect(n.endsWith('-0042')).toBe(true);
  });

  it('parseOrderNumber 反解（無後綴）', () => {
    const r = parseOrderNumber('20260515-0042');
    expect(r).toEqual({ date: '2026-05-15', seq: 42 });
  });

  it('parseOrderNumber 反解（含隨機後綴）', () => {
    const r = parseOrderNumber('20260515-0042-7UKP');
    expect(r).toEqual({ date: '2026-05-15', seq: 42 });
  });

  it('parseOrderNumber 不合法 → null', () => {
    expect(parseOrderNumber('abc')).toBeNull();
  });
});

describe('state-machine', () => {
  it('合法轉換', () => {
    expect(canTransition('draft', 'pending-payment')).toBe(true);
    expect(canTransition('paid', 'preparing')).toBe(true);
  });

  it('非法轉換', () => {
    expect(canTransition('draft', 'shipped')).toBe(false);
    expect(canTransition('completed', 'paid')).toBe(false);
  });

  it('終止狀態', () => {
    expect(isTerminal('refunded')).toBe(true);
    expect(isTerminal('cancelled')).toBe(true);
    expect(isTerminal('paid')).toBe(false);
  });

  it('nextStates', () => {
    expect(nextStates('paid')).toContain('preparing');
    expect(nextStates('paid')).toContain('cancelled');
  });
});

describe('OrderService', () => {
  it('submit emit order.created', () => {
    const events: DomainEvent[] = [];
    const svc = new OrderService({ emit: (e) => events.push(e) });
    const next = svc.submit(makeOrder());
    expect(next.status).toBe('pending-payment');
    expect(events[0]?.type).toBe('order.created');
  });

  it('markPaid emit order.paid', () => {
    const emit = vi.fn();
    const svc = new OrderService({ emit });
    const paid = svc.markPaid(makeOrder({ status: 'pending-payment' }));
    expect(paid.status).toBe('paid');
    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'order.paid' }),
    );
  });

  it('markShipped 紀錄 tracking + emit', () => {
    const emit = vi.fn();
    const svc = new OrderService({ emit });
    const shipped = svc.markShipped(makeOrder({ status: 'preparing' }), 'TW123');
    expect(shipped.trackingNumber).toBe('TW123');
  });

  it('非法轉換 throw', () => {
    const svc = new OrderService();
    expect(() => svc.complete(makeOrder({ status: 'draft' }))).toThrow(/illegal/);
  });

  it('cancel 從 paid → cancelled', () => {
    const emit = vi.fn();
    const svc = new OrderService({ emit });
    const c = svc.cancel(makeOrder({ status: 'paid' }), '客戶要求');
    expect(c.status).toBe('cancelled');
    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'order.cancelled' }),
    );
  });

  it('statusHistory 累計', () => {
    const svc = new OrderService();
    let o = makeOrder();
    o = svc.submit(o);
    o = svc.markPaid(o);
    expect(o.statusHistory).toHaveLength(3);
    expect(o.statusHistory[2]!.to).toBe('paid');
  });
});
