import { describe, expect, it } from 'vitest';

import { InMemoryAdSpendStore, InMemoryLpEventStore } from './in-memory-store.js';
import { LpAnalyticsService, type ExternalTracker } from './service.js';

import type { LpEvent } from './types.js';

function ev(overrides: Partial<LpEvent>): LpEvent {
  return {
    tenantId: 't1',
    pageId: 'p1',
    sessionId: 's1',
    visitorId: 'v1',
    event: 'PageView',
    occurredAt: new Date('2026-05-15T10:00:00Z'),
    ...overrides,
  } as LpEvent;
}

function setup(trackers: ExternalTracker[] = []) {
  const events = new InMemoryLpEventStore();
  const spend = new InMemoryAdSpendStore();
  return { events, spend, svc: new LpAnalyticsService(events, spend, trackers) };
}

describe('LpAnalyticsService.track', () => {
  it('Purchase 缺 value → throw', async () => {
    const { svc } = setup();
    await expect(svc.track(ev({ event: 'Purchase' }))).rejects.toThrow(/Purchase/);
  });

  it('Purchase 完整 → 寫入成功', async () => {
    const { svc } = setup();
    await svc.track(
      ev({ event: 'Purchase', valueMinor: 99000, currency: 'TWD', orderId: 'o1' }),
    );
  });

  it('fan-out 外掛失敗不影響本地寫入', async () => {
    const failingTracker: ExternalTracker = {
      name: 'meta',
      send: async () => {
        throw new Error('network');
      },
    };
    const okTracker: ExternalTracker = { name: 'ga4', send: async () => undefined };
    const { svc, events } = setup([failingTracker, okTracker]);
    const r = await svc.track(ev({}));
    expect(r.trackerFailures).toEqual(['meta']);
    const list = await events.listByPage('t1', 'p1');
    expect(list).toHaveLength(1);
  });
});

describe('LpAnalyticsService.funnel', () => {
  it('每階段去重 + 算累計轉換率', async () => {
    const { svc } = setup();
    // 兩個 visitor 看了首頁，一個走到 Purchase
    await svc.track(ev({ visitorId: 'v1', event: 'PageView' }));
    await svc.track(ev({ visitorId: 'v1', event: 'PageView' })); // 重複，去重
    await svc.track(ev({ visitorId: 'v2', event: 'PageView' }));
    await svc.track(ev({ visitorId: 'v1', event: 'ViewContent' }));
    await svc.track(ev({ visitorId: 'v1', event: 'AddToCart' }));
    await svc.track(ev({ visitorId: 'v1', event: 'InitiateCheckout' }));
    await svc.track(ev({ visitorId: 'v1', event: 'AddPaymentInfo' }));
    await svc.track(
      ev({
        visitorId: 'v1',
        event: 'Purchase',
        valueMinor: 99000,
        currency: 'TWD',
        orderId: 'o1',
      }),
    );
    const funnel = await svc.funnel('t1', 'p1');
    expect(funnel[0]?.uniqueVisitors).toBe(2); // PageView
    expect(funnel[5]?.uniqueVisitors).toBe(1); // Purchase
    expect(funnel[5]?.overallConversionRate).toBeCloseTo(0.5);
  });

  it('完全沒事件 → 全 0', async () => {
    const { svc } = setup();
    const funnel = await svc.funnel('t1', 'p1');
    expect(funnel[0]?.uniqueVisitors).toBe(0);
    expect(funnel[5]?.overallConversionRate).toBe(0);
  });
});

describe('LpAnalyticsService.sourceReport - ROAS / CPA', () => {
  it('按 UTM 分組 + 套用 spend', async () => {
    const { svc } = setup();
    await svc.recordAdSpend({
      tenantId: 't1',
      pageId: 'p1',
      campaign: 'summer',
      spendMinor: 10000,
      date: '2026-05-15',
    });
    // 100 visitor 從 summer 來，1 轉換
    for (let i = 0; i < 100; i += 1) {
      await svc.track(
        ev({
          visitorId: `v${i}`,
          event: 'PageView',
          utm: { source: 'facebook', medium: 'cpc', campaign: 'summer' },
        }),
      );
    }
    await svc.track(
      ev({
        visitorId: 'v0',
        event: 'Purchase',
        valueMinor: 99000,
        currency: 'TWD',
        orderId: 'o1',
        utm: { source: 'facebook', medium: 'cpc', campaign: 'summer' },
      }),
    );
    const report = await svc.sourceReport('t1', 'p1');
    expect(report).toHaveLength(1);
    expect(report[0]?.visitors).toBe(100);
    expect(report[0]?.purchases).toBe(1);
    expect(report[0]?.spendMinor).toBe(10000);
    expect(report[0]?.roas).toBeCloseTo(99000 / 10000);
    expect(report[0]?.cpaMinor).toBe(10000);
  });

  it('沒花費 → roas = Infinity', async () => {
    const { svc } = setup();
    await svc.track(
      ev({
        visitorId: 'v1',
        event: 'PageView',
        utm: { source: 'organic', medium: 'social', campaign: 'organic-fb' },
      }),
    );
    await svc.track(
      ev({
        visitorId: 'v1',
        event: 'Purchase',
        valueMinor: 99000,
        currency: 'TWD',
        orderId: 'o1',
        utm: { source: 'organic', medium: 'social', campaign: 'organic-fb' },
      }),
    );
    const report = await svc.sourceReport('t1', 'p1');
    expect(report[0]?.roas).toBe(Infinity);
  });

  it('沒 UTM → (direct) 群組', async () => {
    const { svc } = setup();
    await svc.track(ev({ visitorId: 'v1', event: 'PageView' }));
    const report = await svc.sourceReport('t1', 'p1');
    expect(report[0]?.source).toBe('(direct)');
  });
});
