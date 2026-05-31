import { describe, expect, it } from 'vitest';

import {
  InMemoryUpsellEventStore,
  InMemoryUpsellSessionStore,
} from './in-memory-store.js';
import { UpsellFunnelService } from './service.js';

import type { OneClickChargeHook } from './service.js';
import type { UpsellFunnelConfig } from './types.js';

function makeConfig(): UpsellFunnelConfig {
  return {
    tenantId: 't1',
    pageId: 'p1',
    offers: [
      { id: 'o1', productId: 'p_oto1', headline: '等等，老闆加碼', priceMinor: 50000 },
      {
        id: 'o2',
        productId: 'p_oto2',
        headline: '最後機會',
        priceMinor: 80000,
        discountedPriceMinor: 60000,
      },
    ],
    thankYouSlug: '/thanks',
  };
}

function setup(charge?: OneClickChargeHook) {
  const sessions = new InMemoryUpsellSessionStore();
  const events = new InMemoryUpsellEventStore();
  let n = 0;
  const svc = new UpsellFunnelService(sessions, events, {
    now: () => new Date('2026-05-15T10:00:00Z'),
    genId: () => `us_${++n}`,
    charge,
  });
  return { sessions, events, svc };
}

describe('UpsellFunnelService.start', () => {
  it('正常啟動 → 第一個 OTO', async () => {
    const { svc } = setup();
    const { session, step } = await svc.start({
      orderId: 'ord1',
      config: makeConfig(),
      hasStoredPayment: true,
    });
    expect(session.cursor).toBe(0);
    expect(step.kind).toBe('offer');
    if (step.kind === 'offer') expect(step.offer.id).toBe('o1');
  });

  it('沒有付款憑證 → 直接感謝頁', async () => {
    const { svc } = setup();
    const { session, step } = await svc.start({
      orderId: 'ord1',
      config: makeConfig(),
      hasStoredPayment: false,
    });
    expect(session.done).toBe(true);
    expect(step.kind).toBe('thank-you');
  });

  it('沒有 OTO 設定 → 直接感謝頁', async () => {
    const { svc } = setup();
    const cfg = { ...makeConfig(), offers: [] };
    const { step } = await svc.start({ orderId: 'ord1', config: cfg, hasStoredPayment: true });
    expect(step.kind).toBe('thank-you');
  });
});

describe('UpsellFunnelService.accept / skip', () => {
  it('accept 成功 → 前進並累加金額', async () => {
    const charge: OneClickChargeHook = async () => ({ success: true, chargeId: 'ch1' });
    const { svc } = setup(charge);
    const { session } = await svc.start({
      orderId: 'ord1',
      config: makeConfig(),
      hasStoredPayment: true,
    });
    const { session: s1, chargeId } = await svc.accept(session.id);
    expect(chargeId).toBe('ch1');
    expect(s1.cursor).toBe(1);
    expect(s1.upsellTotalMinor).toBe(50000);
    expect(s1.acceptedOfferIds).toEqual(['o1']);
  });

  it('accept 第二層套用 discountedPrice', async () => {
    const charge: OneClickChargeHook = async () => ({ success: true });
    const { svc } = setup(charge);
    const { session } = await svc.start({
      orderId: 'ord1',
      config: makeConfig(),
      hasStoredPayment: true,
    });
    const a1 = await svc.accept(session.id);
    const a2 = await svc.accept(a1.session.id);
    expect(a2.session.upsellTotalMinor).toBe(50000 + 60000);
    expect(a2.session.done).toBe(true);
    expect(a2.step.kind).toBe('thank-you');
  });

  it('skip → 不扣款、前進、step 是下一個', async () => {
    const { svc } = setup();
    const { session } = await svc.start({
      orderId: 'ord1',
      config: makeConfig(),
      hasStoredPayment: true,
    });
    const { session: s1, step } = await svc.skip(session.id);
    expect(s1.cursor).toBe(1);
    expect(s1.upsellTotalMinor).toBe(0);
    expect(s1.skippedOfferIds).toEqual(['o1']);
    if (step.kind === 'offer') expect(step.offer.id).toBe('o2');
  });

  it('扣款失敗 → throw，cursor 不動', async () => {
    const charge: OneClickChargeHook = async () => ({ success: false, reason: '卡片過期' });
    const { svc, sessions } = setup(charge);
    const { session } = await svc.start({
      orderId: 'ord1',
      config: makeConfig(),
      hasStoredPayment: true,
    });
    await expect(svc.accept(session.id)).rejects.toThrow(/卡片過期/);
    const s = await sessions.findById(session.id);
    expect(s?.cursor).toBe(0);
  });

  it('沒注入 charge hook → accept throw', async () => {
    const { svc } = setup();
    const { session } = await svc.start({
      orderId: 'ord1',
      config: makeConfig(),
      hasStoredPayment: true,
    });
    await expect(svc.accept(session.id)).rejects.toThrow(/OneClickChargeHook/);
  });

  it('已結束的 session 再 accept → throw', async () => {
    const charge: OneClickChargeHook = async () => ({ success: true });
    const { svc } = setup(charge);
    const { session } = await svc.start({
      orderId: 'ord1',
      config: makeConfig(),
      hasStoredPayment: true,
    });
    const a1 = await svc.accept(session.id);
    const a2 = await svc.accept(a1.session.id);
    expect(a2.session.done).toBe(true);
    await expect(svc.accept(a2.session.id)).rejects.toThrow(/已結束/);
  });
});

describe('UpsellFunnelService stats', () => {
  it('peek 累計 view，accept/skip 各自累計', async () => {
    const charge: OneClickChargeHook = async () => ({ success: true });
    const { svc } = setup(charge);
    const cfg = makeConfig();
    const { session: s1 } = await svc.start({ orderId: 'o1', config: cfg, hasStoredPayment: true });
    await svc.accept(s1.id);
    const { session: s2 } = await svc.start({ orderId: 'o2', config: cfg, hasStoredPayment: true });
    await svc.skip(s2.id);
    const stats = await svc.statsOf('t1', 'o1');
    // start + accept 還有 start 後的 peek → views=3 但 accept/skip 各 1
    expect(stats.views).toBeGreaterThanOrEqual(2);
    expect(stats.accepts).toBe(1);
    expect(stats.skips).toBe(1);
  });
});
