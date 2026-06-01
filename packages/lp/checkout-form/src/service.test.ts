import { describe, expect, it } from 'vitest';

import {
  InMemoryOrderDraftStore,
  InMemoryOtpStore,
} from './in-memory-store.js';
import { LpCheckoutFormService, type CheckoutFormConfig } from './service.js';

import type { LpFormPayload } from './types.js';

function makeConfig(overrides: Partial<CheckoutFormConfig> = {}): CheckoutFormConfig {
  return {
    tenantId: 't1',
    pageId: 'p1',
    plans: [
      { id: 'basic', title: '基礎方案', priceMinor: 99000 },
      { id: 'pro', title: '進階方案', priceMinor: 199000 },
    ],
    paymentMethods: ['credit-card', 'cod'],
    otpEnabled: false,
    ...overrides,
  };
}

function basePayload(overrides: Partial<LpFormPayload> = {}): LpFormPayload {
  return {
    tenantId: 't1',
    pageId: 'p1',
    planId: 'basic',
    paymentMethod: 'credit-card',
    customer: { name: '小明', phone: '0912345678', email: 'a@b.com' },
    ...overrides,
  };
}

function setup(opts: ConstructorParameters<typeof LpCheckoutFormService>[2] = {}) {
  const orders = new InMemoryOrderDraftStore();
  const otps = new InMemoryOtpStore();
  let n = 0;
  const svc = new LpCheckoutFormService(orders, otps, {
    genId: () => `od_${++n}`,
    now: () => new Date('2026-05-15T10:00:00Z'),
    ...opts,
  });
  return { orders, otps, svc };
}

describe('LpCheckoutFormService.submit', () => {
  it('信用卡建單成功並標記 hasStoredPayment', async () => {
    const { svc } = setup();
    const draft = await svc.submit(makeConfig(), basePayload());
    expect(draft.status).toBe('pending');
    expect(draft.totalMinor).toBe(99000);
    expect(draft.hasStoredPayment).toBe(true);
    expect(draft.id).toBe('od_1');
  });

  it('COD 沒填地址 → throw', async () => {
    const { svc } = setup();
    await expect(
      svc.submit(makeConfig(), basePayload({ paymentMethod: 'cod' })),
    ).rejects.toThrow(/收件地址/);
  });

  it('COD 有地址通過且不留付款憑證', async () => {
    const { svc } = setup();
    const draft = await svc.submit(
      makeConfig(),
      basePayload({
        paymentMethod: 'cod',
        shipping: { zip: '100', city: '台北市', district: '中正區', street: 'A 路 1 號' },
      }),
    );
    expect(draft.hasStoredPayment).toBe(false);
  });

  it('未支援的 paymentMethod → throw', async () => {
    const { svc } = setup();
    await expect(
      svc.submit(
        makeConfig({ paymentMethods: ['credit-card'] }),
        basePayload({ paymentMethod: 'line-pay' }),
      ),
    ).rejects.toThrow(/不支援/);
  });

  it('planId 不存在 → throw', async () => {
    const { svc } = setup();
    await expect(svc.submit(makeConfig(), basePayload({ planId: 'nope' }))).rejects.toThrow(/找不到方案/);
  });

  it('手機格式錯誤 → throw', async () => {
    const { svc } = setup();
    await expect(
      svc.submit(makeConfig(), basePayload({ customer: { name: '小明', phone: '123' } })),
    ).rejects.toThrow(/表單驗證失敗/);
  });

  it('Order Bump 接受 → 加進訂單', async () => {
    const { svc } = setup();
    const cfg = makeConfig({
      orderBump: { productId: 'bump1', title: '加購好物', priceMinor: 20000 },
    });
    const draft = await svc.submit(cfg, basePayload({ orderBumpAccepted: true }));
    expect(draft.items).toHaveLength(2);
    expect(draft.totalMinor).toBe(119000);
  });

  it('Order Bump 未勾選 → 不加', async () => {
    const { svc } = setup();
    const cfg = makeConfig({
      orderBump: { productId: 'bump1', title: '加購好物', priceMinor: 20000 },
    });
    const draft = await svc.submit(cfg, basePayload({ orderBumpAccepted: false }));
    expect(draft.items).toHaveLength(1);
  });

  it('折扣碼解析成功 → 折抵 total', async () => {
    const { svc } = setup({
      discountResolver: async (code, ctx) => {
        if (code === 'SAVE100') return { amountMinor: 10000, description: '折 100' };
        return ctx.subtotalMinor > 0 ? undefined : undefined;
      },
    });
    const draft = await svc.submit(makeConfig(), basePayload({ couponCode: 'SAVE100' }));
    expect(draft.totalMinor).toBe(89000);
  });

  it('OTP 啟用但沒附驗證碼 → throw', async () => {
    const { svc } = setup();
    await expect(
      svc.submit(makeConfig({ otpEnabled: true }), basePayload()),
    ).rejects.toThrow(/OTP/);
  });
});

describe('LpCheckoutFormService OTP', () => {
  it('issueOtp 寫入並可 verify 通過', async () => {
    const { svc } = setup({ genOtp: () => '123456' });
    await svc.issueOtp('t1', '0912345678');
    expect(await svc.verifyOtp('t1', '0912345678', '123456')).toBe(true);
    expect(await svc.verifyOtp('t1', '0912345678', '999999')).toBe(false);
  });

  it('過期 OTP → verify false', async () => {
    let nowVal = new Date('2026-05-15T10:00:00Z').getTime();
    const orders = new InMemoryOrderDraftStore();
    const otps = new InMemoryOtpStore();
    const svc = new LpCheckoutFormService(orders, otps, {
      now: () => new Date(nowVal),
      genOtp: () => '654321',
      otpTtlMinutes: 5,
    });
    await svc.issueOtp('t1', '0912345678');
    nowVal += 6 * 60_000;
    expect(await svc.verifyOtp('t1', '0912345678', '654321')).toBe(false);
  });

  it('提交時自動驗 OTP 並 consume', async () => {
    const { svc, otps } = setup({ genOtp: () => '111111' });
    await svc.issueOtp('t1', '0912345678');
    const draft = await svc.submit(
      makeConfig({ otpEnabled: true }),
      basePayload({ otpCode: '111111' }),
    );
    expect(draft.status).toBe('pending');
    const rec = await otps.find('t1', '0912345678');
    expect(rec?.consumedAt).toBeDefined();
  });
});

describe('LpCheckoutFormService OTP rate-limit', () => {
  it('短窗超量 → throw', async () => {
    let nowVal = new Date('2026-05-15T10:00:00Z').getTime();
    const orders = new InMemoryOrderDraftStore();
    const otps = new InMemoryOtpStore();
    const svc = new LpCheckoutFormService(orders, otps, {
      now: () => new Date(nowVal),
      genOtp: () => '111111',
    });
    await svc.issueOtp('t1', '0912345678');
    nowVal += 60_000;
    await svc.issueOtp('t1', '0912345678');
    nowVal += 60_000;
    await svc.issueOtp('t1', '0912345678');
    nowVal += 60_000;
    await expect(svc.issueOtp('t1', '0912345678')).rejects.toThrow(/頻繁/);
  });

  it('短窗過後可以再發', async () => {
    let nowVal = new Date('2026-05-15T10:00:00Z').getTime();
    const orders = new InMemoryOrderDraftStore();
    const otps = new InMemoryOtpStore();
    const svc = new LpCheckoutFormService(orders, otps, {
      now: () => new Date(nowVal),
      genOtp: () => '111111',
    });
    for (let i = 0; i < 3; i += 1) {
      await svc.issueOtp('t1', '0912345678');
      nowVal += 60_000;
    }
    // 跳出短窗（10 分鐘）
    nowVal += 11 * 60_000;
    await expect(svc.issueOtp('t1', '0912345678')).resolves.toBeDefined();
  });

  it('長窗超量 → throw', async () => {
    let nowVal = new Date('2026-05-15T10:00:00Z').getTime();
    const orders = new InMemoryOrderDraftStore();
    const otps = new InMemoryOtpStore();
    const svc = new LpCheckoutFormService(orders, otps, {
      now: () => new Date(nowVal),
      genOtp: () => '111111',
      otpRateLimit: { shortWindowMax: 100, longWindowMax: 2, longWindowMinutes: 60 },
    });
    await svc.issueOtp('t1', '0912345678');
    nowVal += 60_000;
    await svc.issueOtp('t1', '0912345678');
    nowVal += 60_000;
    await expect(svc.issueOtp('t1', '0912345678')).rejects.toThrow(/上限/);
  });

  it('不同 phone 互不影響', async () => {
    let nowVal = new Date('2026-05-15T10:00:00Z').getTime();
    const orders = new InMemoryOrderDraftStore();
    const otps = new InMemoryOtpStore();
    const svc = new LpCheckoutFormService(orders, otps, {
      now: () => new Date(nowVal),
      genOtp: () => '111111',
    });
    for (let i = 0; i < 3; i += 1) {
      await svc.issueOtp('t1', '0912345678');
      nowVal += 1_000;
    }
    await expect(svc.issueOtp('t1', '0987654321')).resolves.toBeDefined();
  });
});

describe('LpCheckoutFormService.markStatus', () => {
  it('金流回呼更新狀態', async () => {
    const { svc } = setup();
    const draft = await svc.submit(makeConfig(), basePayload());
    await svc.markStatus(draft.id, 'paid');
    const updated = await svc.getDraft(draft.id);
    expect(updated?.status).toBe('paid');
  });
});
