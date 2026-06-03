import { describe, expect, it, vi } from 'vitest';

import { InMemoryReturnStore } from './in-memory-store.js';
import { ReturnService } from './service.js';

import type { CreateReturnInput, InvoiceAllowanceIssuer } from './types.js';

function makeInput(overrides: Partial<CreateReturnInput> = {}): CreateReturnInput {
  return {
    tenantId: 't1',
    orderId: 'o1',
    userId: 'u1',
    kind: overrides.kind ?? 'refund',
    reason: overrides.reason ?? 'defective',
    items: overrides.items ?? [
      { variantId: 'v1', productId: 'p1', quantity: 1, unitPrice: 1000, paidAmount: 900 },
    ],
    refundAmount: overrides.refundAmount ?? 900,
    shippingFeePayer: overrides.shippingFeePayer ?? 'merchant',
    orderDeliveredAt: overrides.orderDeliveredAt ?? new Date('2026-05-10T00:00:00Z'),
    ...overrides,
  };
}

describe('ReturnService', () => {
  it('建立申請進入 pending', async () => {
    const service = new ReturnService(new InMemoryReturnStore(), {
      now: () => new Date('2026-05-15T00:00:00Z'),
    });
    const r = await service.createRequest(makeInput());
    expect(r.status).toBe('pending');
    expect(r.withinCoolingPeriod).toBe(true);
  });

  it('鑑賞期過期 withinCoolingPeriod=false', async () => {
    const service = new ReturnService(new InMemoryReturnStore(), {
      now: () => new Date('2026-05-30T00:00:00Z'),
    });
    const r = await service.createRequest(
      makeInput({ orderDeliveredAt: new Date('2026-05-10T00:00:00Z') }),
    );
    expect(r.withinCoolingPeriod).toBe(false);
  });

  it('狀態流：pending → approved → received → refunded', async () => {
    const service = new ReturnService(new InMemoryReturnStore(), {
      now: () => new Date('2026-05-15T00:00:00Z'),
    });
    const r = await service.createRequest(makeInput());
    await service.approve(r.id);
    await service.markReceived(r.id);
    const issuer: InvoiceAllowanceIssuer = {
      issueAllowance: vi.fn().mockResolvedValue({ allowanceId: 'aw-1' }),
    };
    const refunded = await service.completeRefund({
      id: r.id,
      invoiceId: 'inv-1',
      issuer,
    });
    expect(refunded.status).toBe('refunded');
    expect(refunded.allowanceId).toBe('aw-1');
    expect(issuer.issueAllowance).toHaveBeenCalledWith({
      invoiceId: 'inv-1',
      amount: 900,
      reason: undefined,
    });
  });

  it('未先 received 不能退款', async () => {
    const service = new ReturnService(new InMemoryReturnStore());
    const r = await service.createRequest(makeInput());
    const issuer: InvoiceAllowanceIssuer = {
      issueAllowance: vi.fn(),
    };
    await expect(
      service.completeRefund({ id: r.id, invoiceId: 'inv-1', issuer }),
    ).rejects.toThrow();
  });

  it('非法狀態轉換拋例外', async () => {
    const service = new ReturnService(new InMemoryReturnStore());
    const r = await service.createRequest(makeInput());
    await service.cancel(r.id);
    await expect(service.approve(r.id)).rejects.toThrow(/illegal/);
  });

  it('換貨流程：記錄新訂單 id', async () => {
    const service = new ReturnService(new InMemoryReturnStore());
    const r = await service.createRequest(makeInput({ kind: 'exchange' }));
    await service.approve(r.id);
    await service.markReceived(r.id);
    const exchanged = await service.markExchanged(r.id, 'order-new-1');
    expect(exchanged.status).toBe('exchanged');
    expect(exchanged.exchangeOrderId).toBe('order-new-1');
  });
});
