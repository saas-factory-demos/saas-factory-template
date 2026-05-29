import { describe, it, expect, vi } from 'vitest';

import { CheckoutService } from './service.js';

import type {
  CartReader,
  CheckoutDeps,
  CheckoutInput,
  InventoryReserver,
  OrderNumberProvider,
  PaymentInitiator,
  ShippingCalculator,
  TaxCalculator,
} from './types.js';
import type { DiscountRule } from '@saas-factory/shop-discount-engine';

function makeDeps(overrides: Partial<CheckoutDeps> = {}): CheckoutDeps {
  const cart: CartReader = {
    load: vi.fn().mockResolvedValue({
      items: [
        {
          variantId: 'v1',
          productId: 'p1',
          sku: 'SKU-1',
          title: '商品 A',
          unitPrice: 500,
          quantity: 2,
        },
      ],
    }),
  };
  const shipping: ShippingCalculator = { calculate: vi.fn().mockResolvedValue(80) };
  const tax: TaxCalculator = { calculate: vi.fn().mockResolvedValue(0) };
  const inventory: InventoryReserver = {
    reserve: vi.fn().mockResolvedValue({ ok: true }),
  };
  const payment: PaymentInitiator = {
    initiate: vi.fn().mockResolvedValue({ redirectUrl: 'https://pay.test/1' }),
  };
  const orderNumber: OrderNumberProvider = { next: vi.fn().mockResolvedValue('20260515-0001') };
  return {
    cart,
    shipping,
    tax,
    payment,
    inventory,
    getRules: vi.fn().mockResolvedValue([]),
    orderNumber,
    orderId: () => 'order-test',
    ...overrides,
  };
}

function makeInput(overrides: Partial<CheckoutInput> = {}): CheckoutInput {
  return {
    tenantId: 'tenant-1',
    userId: null,
    cartId: 'cart-1',
    recipient: {
      name: '王小明',
      phone: '0912345678',
      email: 'a@b.c',
    },
    shipping: { methodId: 'home', fee: 0 },
    payment: { methodId: 'credit-card', provider: 'newebpay' },
    invoice: { carrierType: 'cloud' },
    marketingOptIn: false,
    agreedToTerms: true,
    ...overrides,
  };
}

describe('CheckoutService', () => {
  it('quote 計算小計 + 運費 + 折扣', async () => {
    const rules: DiscountRule[] = [
      {
        id: 'r1',
        tenantId: 'tenant-1',
        name: '九折',
        type: 'percentage_off',
        params: { percentage: 10 },
        conditions: [],
        stackable: true,
        priority: 1,
        usedCount: 0,
        active: true,
      },
    ];
    const deps = makeDeps({ getRules: vi.fn().mockResolvedValue(rules) });
    const service = new CheckoutService(deps);
    const quote = await service.quote(makeInput());
    expect(quote.subtotal).toBe(1000);
    expect(quote.discountTotal).toBe(100);
    expect(quote.shippingFee).toBe(80);
    expect(quote.total).toBe(980);
  });

  it('submit 完整流程：預扣庫存 + 建單 + 啟動金流', async () => {
    const deps = makeDeps();
    const service = new CheckoutService(deps);
    const result = await service.submit(makeInput());
    expect(result.order.status).toBe('pending-payment');
    expect(result.order.orderNumber).toBe('20260515-0001');
    expect(result.paymentRedirect).toBe('https://pay.test/1');
    expect(deps.inventory.reserve).toHaveBeenCalled();
    expect(deps.payment.initiate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 1080, provider: 'newebpay' }),
    );
  });

  it('未同意條款拒絕送出', async () => {
    const service = new CheckoutService(makeDeps());
    await expect(service.submit(makeInput({ agreedToTerms: false }))).rejects.toThrow('未同意條款');
  });

  it('庫存不足拒絕送出', async () => {
    const deps = makeDeps({
      inventory: {
        reserve: vi.fn().mockResolvedValue({ ok: false, failedVariantIds: ['v1'] }),
      },
    });
    const service = new CheckoutService(deps);
    await expect(service.submit(makeInput())).rejects.toThrow(/庫存不足/);
  });

  it('購物車為空拒絕送出', async () => {
    const deps = makeDeps({
      cart: { load: vi.fn().mockResolvedValue({ items: [] }) },
    });
    const service = new CheckoutService(deps);
    await expect(service.quote(makeInput())).rejects.toThrow('購物車為空');
  });

  it('免運折扣覆蓋運費', async () => {
    const rules: DiscountRule[] = [
      {
        id: 'r-ship',
        tenantId: 'tenant-1',
        name: '免運',
        type: 'free_shipping',
        params: { shippingFee: 80 },
        conditions: [],
        stackable: true,
        priority: 1,
        usedCount: 0,
        active: true,
      },
    ];
    const deps = makeDeps({ getRules: vi.fn().mockResolvedValue(rules) });
    const service = new CheckoutService(deps);
    const quote = await service.quote(makeInput());
    expect(quote.shippingFee).toBe(0);
    expect(quote.shippingDiscount).toBe(80);
  });

  it('折扣堆疊不可超過 subtotal（避免負金額）', async () => {
    const rules: DiscountRule[] = [
      {
        id: 'r-big',
        tenantId: 'tenant-1',
        name: '減 800',
        type: 'fixed_off',
        params: { amount: 800 },
        conditions: [],
        stackable: true,
        priority: 1,
        usedCount: 0,
        active: true,
      },
      {
        id: 'r-big2',
        tenantId: 'tenant-1',
        name: '再減 800',
        type: 'fixed_off',
        params: { amount: 800 },
        conditions: [],
        stackable: true,
        priority: 1,
        usedCount: 0,
        active: true,
      },
    ];
    const deps = makeDeps({ getRules: vi.fn().mockResolvedValue(rules) });
    const service = new CheckoutService(deps);
    const quote = await service.quote(makeInput());
    expect(quote.discountTotal).toBe(1000);
    expect(quote.total).toBe(80);
  });

  it('per-user 使用次數採每規則獨立判斷', async () => {
    const rules: DiscountRule[] = [
      {
        id: 'r-a',
        tenantId: 'tenant-1',
        name: 'A 已用滿',
        type: 'fixed_off',
        params: { amount: 100 },
        conditions: [],
        stackable: true,
        priority: 1,
        maxUsesPerUser: 1,
        usedCount: 0,
        active: true,
      },
      {
        id: 'r-b',
        tenantId: 'tenant-1',
        name: 'B 沒用過',
        type: 'fixed_off',
        params: { amount: 50 },
        conditions: [],
        stackable: true,
        priority: 1,
        maxUsesPerUser: 1,
        usedCount: 0,
        active: true,
      },
    ];
    const deps = makeDeps({
      getRules: vi.fn().mockResolvedValue({
        rules,
        customerUsageCounts: { 'r-a': 1 },
      }),
    });
    const service = new CheckoutService(deps);
    const quote = await service.quote(makeInput());
    // 只 B 應生效。
    expect(quote.discountTotal).toBe(50);
  });

  it('金流啟動失敗時呼叫 rollbackOrder 並釋放庫存', async () => {
    const release = vi.fn().mockResolvedValue(undefined);
    const rollback = vi.fn().mockResolvedValue(undefined);
    const deps = makeDeps({
      inventory: {
        reserve: vi.fn().mockResolvedValue({ ok: true }),
        release,
      },
      payment: {
        initiate: vi.fn().mockRejectedValue(new Error('銀行系統暫無回應')),
      },
      rollbackOrder: rollback,
    });
    const service = new CheckoutService(deps);
    await expect(service.submit(makeInput())).rejects.toThrow('銀行系統暫無回應');
    expect(rollback).toHaveBeenCalledOnce();
    expect(release).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'tenant-1', orderId: 'order-test' }),
    );
  });

  it('persistOrder 失敗時釋放庫存且不啟動金流', async () => {
    const release = vi.fn().mockResolvedValue(undefined);
    const initiate = vi.fn();
    const deps = makeDeps({
      inventory: {
        reserve: vi.fn().mockResolvedValue({ ok: true }),
        release,
      },
      payment: { initiate },
      persistOrder: vi.fn().mockRejectedValue(new Error('DB 連線失敗')),
    });
    const service = new CheckoutService(deps);
    await expect(service.submit(makeInput())).rejects.toThrow('DB 連線失敗');
    expect(release).toHaveBeenCalledOnce();
    expect(initiate).not.toHaveBeenCalled();
  });

  it('折扣依比例分攤到 items', async () => {
    const rules: DiscountRule[] = [
      {
        id: 'r-fix',
        tenantId: 'tenant-1',
        name: '減 100',
        type: 'fixed_off',
        params: { amount: 100 },
        conditions: [],
        stackable: true,
        priority: 1,
        usedCount: 0,
        active: true,
      },
    ];
    const deps = makeDeps({ getRules: vi.fn().mockResolvedValue(rules) });
    const service = new CheckoutService(deps);
    const quote = await service.quote(makeInput());
    expect(quote.items[0]!.allocatedDiscount).toBe(100);
  });
});
