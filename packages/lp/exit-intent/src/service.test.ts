import { describe, expect, it } from 'vitest';

import {
  InMemoryExitLeadStore,
  InMemoryExitStatsStore,
  InMemoryVisitorExitStateStore,
} from './in-memory-store.js';
import { ExitIntentService, type CouponIssueHook } from './service.js';

import type { ExitIntentConfig } from './types.js';

function makeConfig(overrides: Partial<ExitIntentConfig> = {}): ExitIntentConfig {
  return {
    tenantId: 't1',
    pageId: 'p1',
    enabled: true,
    triggers: ['mouse-leave-top', 'mobile-scroll-up'],
    minDwellSeconds: 10,
    cooldownSeconds: 60,
    maxShowPerSession: 1,
    variants: [
      { id: 'A', weight: 1, headline: 'A', body: '', ctaLabel: '領', couponTemplateId: 'tpl_a' },
    ],
    ...overrides,
  };
}

function setup(opts: {
  couponIssue?: CouponIssueHook;
  random?: () => number;
  now?: () => Date;
} = {}) {
  const state = new InMemoryVisitorExitStateStore();
  const leads = new InMemoryExitLeadStore();
  const stats = new InMemoryExitStatsStore();
  const svc = new ExitIntentService(state, leads, stats, {
    now: opts.now ?? (() => new Date('2026-05-15T10:00:00Z')),
    random: opts.random ?? (() => 0),
    couponIssue: opts.couponIssue,
  });
  return { state, leads, stats, svc };
}

describe('ExitIntentService.decide 基本規則', () => {
  it('滿足條件 → show', async () => {
    const { svc } = setup();
    const d = await svc.decide(makeConfig(), {
      visitorId: 'v1',
      trigger: 'mouse-leave-top',
      dwellSeconds: 20,
      hasConverted: false,
    });
    expect(d.show).toBe(true);
  });

  it('已轉換 → 不顯示', async () => {
    const { svc } = setup();
    const d = await svc.decide(makeConfig(), {
      visitorId: 'v1',
      trigger: 'mouse-leave-top',
      dwellSeconds: 20,
      hasConverted: true,
    });
    expect(d.show).toBe(false);
    if (!d.show) expect(d.reason).toBe('already-converted');
  });

  it('停留太短 → 不顯示', async () => {
    const { svc } = setup();
    const d = await svc.decide(makeConfig(), {
      visitorId: 'v1',
      trigger: 'mouse-leave-top',
      dwellSeconds: 5,
      hasConverted: false,
    });
    expect(d.show).toBe(false);
  });

  it('disabled → 不顯示', async () => {
    const { svc } = setup();
    const d = await svc.decide(makeConfig({ enabled: false }), {
      visitorId: 'v1',
      trigger: 'mouse-leave-top',
      dwellSeconds: 20,
      hasConverted: false,
    });
    expect(d.show).toBe(false);
  });

  it('不允許的 trigger → 不顯示', async () => {
    const { svc } = setup();
    const d = await svc.decide(makeConfig({ triggers: ['mouse-leave-top'] }), {
      visitorId: 'v1',
      trigger: 'tab-blur',
      dwellSeconds: 20,
      hasConverted: false,
    });
    expect(d.show).toBe(false);
  });

  it('超過 maxShowPerSession → 不顯示', async () => {
    const { svc } = setup();
    const cfg = makeConfig({ maxShowPerSession: 1 });
    const d1 = await svc.decide(cfg, {
      visitorId: 'v1',
      trigger: 'mouse-leave-top',
      dwellSeconds: 20,
      hasConverted: false,
    });
    expect(d1.show).toBe(true);
    const d2 = await svc.decide(cfg, {
      visitorId: 'v1',
      trigger: 'mouse-leave-top',
      dwellSeconds: 20,
      hasConverted: false,
    });
    expect(d2.show).toBe(false);
  });

  it('冷卻時間內 → 不顯示', async () => {
    let nowVal = new Date('2026-05-15T10:00:00Z').getTime();
    const { svc } = setup({ now: () => new Date(nowVal) });
    const cfg = makeConfig({ maxShowPerSession: 5, cooldownSeconds: 60 });
    await svc.decide(cfg, {
      visitorId: 'v1',
      trigger: 'mouse-leave-top',
      dwellSeconds: 20,
      hasConverted: false,
    });
    nowVal += 30_000;
    const d2 = await svc.decide(cfg, {
      visitorId: 'v1',
      trigger: 'mouse-leave-top',
      dwellSeconds: 20,
      hasConverted: false,
    });
    expect(d2.show).toBe(false);
    if (!d2.show) expect(d2.reason).toBe('cooldown');
  });
});

describe('ExitIntentService A/B 變體分配', () => {
  it('根據 weight 比例分配（random=0 → 第一個）', async () => {
    const { svc } = setup({ random: () => 0 });
    const cfg = makeConfig({
      variants: [
        { id: 'A', weight: 1, headline: 'A', body: '', ctaLabel: '領', couponTemplateId: 'a' },
        { id: 'B', weight: 1, headline: 'B', body: '', ctaLabel: '領', couponTemplateId: 'b' },
      ],
    });
    const d = await svc.decide(cfg, {
      visitorId: 'v1',
      trigger: 'mouse-leave-top',
      dwellSeconds: 20,
      hasConverted: false,
    });
    if (d.show) expect(d.variantId).toBe('A');
  });

  it('random=0.99 → 落到第二個', async () => {
    const { svc } = setup({ random: () => 0.99 });
    const cfg = makeConfig({
      variants: [
        { id: 'A', weight: 1, headline: 'A', body: '', ctaLabel: '領', couponTemplateId: 'a' },
        { id: 'B', weight: 1, headline: 'B', body: '', ctaLabel: '領', couponTemplateId: 'b' },
      ],
    });
    const d = await svc.decide(cfg, {
      visitorId: 'v1',
      trigger: 'mouse-leave-top',
      dwellSeconds: 20,
      hasConverted: false,
    });
    if (d.show) expect(d.variantId).toBe('B');
  });
});

describe('ExitIntentService.captureLead', () => {
  it('成功核發折扣並 suppress', async () => {
    const couponIssue: CouponIssueHook = async () => ({
      code: 'SAVE100',
      expiresAt: new Date('2026-06-15T10:00:00Z'),
    });
    const { svc, leads } = setup({ couponIssue });
    const cfg = makeConfig();
    await svc.decide(cfg, {
      visitorId: 'v1',
      trigger: 'mouse-leave-top',
      dwellSeconds: 20,
      hasConverted: false,
    });
    const coupon = await svc.captureLead(cfg, 'v1', { email: 'a@b.com' });
    expect(coupon.code).toBe('SAVE100');
    const list = await leads.list('t1', 'p1');
    expect(list).toHaveLength(1);
    expect(list[0]?.email).toBe('a@b.com');

    // 第二次 decide 該訪客 → suppressed
    const d2 = await svc.decide(cfg, {
      visitorId: 'v1',
      trigger: 'mouse-leave-top',
      dwellSeconds: 20,
      hasConverted: false,
    });
    expect(d2.show).toBe(false);
    if (!d2.show) expect(d2.reason).toBe('lead-captured');
  });

  it('沒 email 也沒 phone → throw', async () => {
    const { svc } = setup({ couponIssue: async () => ({ code: 'X', expiresAt: new Date() }) });
    const cfg = makeConfig();
    await svc.decide(cfg, {
      visitorId: 'v1',
      trigger: 'mouse-leave-top',
      dwellSeconds: 20,
      hasConverted: false,
    });
    await expect(svc.captureLead(cfg, 'v1', {})).rejects.toThrow(/email/);
  });

  it('沒 decide 過直接 capture → throw', async () => {
    const { svc } = setup({ couponIssue: async () => ({ code: 'X', expiresAt: new Date() }) });
    await expect(
      svc.captureLead(makeConfig(), 'v999', { email: 'a@b.com' }),
    ).rejects.toThrow(/觸發紀錄/);
  });
});

describe('ExitIntentService statsOf', () => {
  it('triggers + captures 累計', async () => {
    const couponIssue: CouponIssueHook = async () => ({
      code: 'X',
      expiresAt: new Date('2026-06-15T10:00:00Z'),
    });
    const { svc } = setup({ couponIssue });
    const cfg = makeConfig();
    await svc.decide(cfg, {
      visitorId: 'v1',
      trigger: 'mouse-leave-top',
      dwellSeconds: 20,
      hasConverted: false,
    });
    await svc.captureLead(cfg, 'v1', { email: 'a@b.com' });
    await svc.decide(cfg, {
      visitorId: 'v2',
      trigger: 'mouse-leave-top',
      dwellSeconds: 20,
      hasConverted: false,
    });
    const stats = await svc.statsOf('t1', 'p1');
    expect(stats).toHaveLength(1);
    expect(stats[0]?.triggers).toBe(2);
    expect(stats[0]?.captures).toBe(1);
    expect(stats[0]?.conversionRate).toBe(0.5);
  });
});
