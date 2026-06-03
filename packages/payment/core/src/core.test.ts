import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SUBSCRIPTION_RETRY,
  InMemoryIdempotencyStore,
  PaymentRouter,
  PreTradeError,
  addMoney,
  nextRetryAt,
  shouldCancelSubscription,
  subtractMoney,
  toMajorUnit,
  toMinorUnit,
} from './index.js';

import type {
  ChargeRequest,
  ChargeResult,
  PaymentProvider,
  RefundRequest,
  RefundResult,
  WebhookEvent,
} from './index.js';

function makeProvider(
  name: PaymentProvider['name'],
  overrides: Partial<PaymentProvider> = {},
): PaymentProvider {
  return {
    name,
    supportedMethods: ['credit', 'atm'],
    async charge(req: ChargeRequest): Promise<ChargeResult> {
      return {
        orderId: req.orderId,
        providerTradeId: `${name}-${req.orderId}`,
        provider: name,
        method: req.method,
        status: 'paid',
        amount: req.amount,
      };
    },
    async refund(req: RefundRequest): Promise<RefundResult> {
      return {
        orderId: req.orderId,
        providerTradeId: req.providerTradeId,
        refundId: `refund-${req.providerTradeId}`,
        amount: req.amount ?? { amount: 0, currency: 'TWD' },
        status: 'refunded',
      };
    },
    async parseWebhook(): Promise<WebhookEvent> {
      return {
        provider: name,
        type: 'charge.paid',
        providerTradeId: 'x',
        raw: {},
        signatureValid: true,
        idempotencyKey: 'k',
        occurredAt: new Date().toISOString(),
      };
    },
    ...overrides,
  };
}

describe('money', () => {
  it('TWD 為 0 位小數（minor = 元）', () => {
    const m = toMinorUnit(100, 'TWD');
    expect(m.amount).toBe(100);
    expect(toMajorUnit(m)).toBe(100);
  });

  it('USD 為 2 位小數（minor = 分）', () => {
    const m = toMinorUnit(99.99, 'USD');
    expect(m.amount).toBe(9999);
    expect(toMajorUnit(m)).toBeCloseTo(99.99);
  });

  it('加減同幣別', () => {
    const a = toMinorUnit(100, 'TWD');
    const b = toMinorUnit(50, 'TWD');
    expect(addMoney(a, b).amount).toBe(150);
    expect(subtractMoney(a, b).amount).toBe(50);
  });

  it('幣別不同會 throw', () => {
    expect(() =>
      addMoney(toMinorUnit(1, 'TWD'), toMinorUnit(1, 'USD')),
    ).toThrow();
  });
});

describe('PaymentRouter', () => {
  const baseCharge: ChargeRequest = {
    orderId: 'order-1',
    tenantId: 't1',
    method: 'credit',
    amount: { amount: 100, currency: 'TWD' },
    idempotencyKey: 'idem-1',
  };

  it('依 routing 表選擇 provider', async () => {
    const newebpay = makeProvider('newebpay');
    const ecpay = makeProvider('ecpay');
    const router = new PaymentRouter({
      providers: [newebpay, ecpay],
      routing: { credit: ['newebpay', 'ecpay'] },
    });
    const result = await router.charge(baseCharge);
    expect(result.providerTradeId.startsWith('newebpay-')).toBe(true);
  });

  it('首個 provider 丟出 PreTradeError → fallback 到下一個', async () => {
    const failing = makeProvider('newebpay', {
      charge: async () => {
        throw new PreTradeError('config rejected');
      },
    });
    const ok = makeProvider('ecpay');
    const router = new PaymentRouter({
      providers: [failing, ok],
      routing: { credit: ['newebpay', 'ecpay'] },
    });
    const result = await router.charge(baseCharge);
    expect(result.providerTradeId.startsWith('ecpay-')).toBe(true);
  });

  it('首個 provider 丟出非 PreTradeError（狀態不明）→ 不 fallback，避免雙重扣款', async () => {
    let secondCalled = false;
    const failing = makeProvider('newebpay', {
      charge: async () => {
        // 模擬網路 timeout：交易可能已建立，狀態不明
        throw new Error('ETIMEDOUT');
      },
    });
    const ok = makeProvider('ecpay', {
      charge: async (req) => {
        secondCalled = true;
        return {
          orderId: req.orderId,
          providerTradeId: `ecpay-${req.orderId}`,
          provider: 'ecpay',
          method: req.method,
          status: 'paid',
          amount: req.amount,
        };
      },
    });
    const router = new PaymentRouter({
      providers: [failing, ok],
      routing: { credit: ['newebpay', 'ecpay'] },
    });
    await expect(router.charge(baseCharge)).rejects.toThrow('ETIMEDOUT');
    expect(secondCalled).toBe(false);
  });

  it('無對應 provider 會 throw', async () => {
    const router = new PaymentRouter({ providers: [], routing: {} });
    await expect(router.charge(baseCharge)).rejects.toThrow(
      /no provider configured/,
    );
  });

  it('refund 走指定 provider', async () => {
    const newebpay = makeProvider('newebpay');
    const router = new PaymentRouter({
      providers: [newebpay],
      routing: { credit: ['newebpay'] },
    });
    const result = await router.refund('newebpay', {
      orderId: 'o1',
      tenantId: 't1',
      providerTradeId: 'tx1',
      idempotencyKey: 'idem-refund',
    });
    expect(result.refundId).toBe('refund-tx1');
  });
});

describe('idempotency store', () => {
  it('remember + has 行為符合 TTL', async () => {
    const store = new InMemoryIdempotencyStore();
    expect(await store.has('k1')).toBe(false);
    await store.remember('k1', 60);
    expect(await store.has('k1')).toBe(true);
  });
});

describe('subscription retry plan', () => {
  it('預設 plan 為 D+1 / D+3 / D+7', () => {
    expect(DEFAULT_SUBSCRIPTION_RETRY.map((p) => p.delayDays)).toEqual([1, 3, 7]);
  });

  it('nextRetryAt 計算正確', () => {
    const base = new Date('2026-01-01T00:00:00Z');
    expect(nextRetryAt(base, 0)?.toISOString()).toBe('2026-01-02T00:00:00.000Z');
    expect(nextRetryAt(base, 1)?.toISOString()).toBe('2026-01-04T00:00:00.000Z');
    expect(nextRetryAt(base, 2)?.toISOString()).toBe('2026-01-08T00:00:00.000Z');
    expect(nextRetryAt(base, 3)).toBe(null);
  });

  it('第 3 次（attempt index 2）失敗後 cancel', () => {
    expect(shouldCancelSubscription(0)).toBe(false);
    expect(shouldCancelSubscription(1)).toBe(false);
    expect(shouldCancelSubscription(2)).toBe(true);
  });
});
