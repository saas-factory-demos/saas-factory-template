import {
  FUNNEL_ORDER,
  type FunnelStepStats,
  type LpEvent,
  type LpEventName,
  type SourceStats,
} from './types.js';

import type { AdSpendStore, LpEventStore } from './in-memory-store.js';

/** 外掛追蹤器：GA4 / Meta Pixel / Conversion API 各自實作。 */
export interface ExternalTracker {
  name: string;
  send(event: LpEvent): Promise<void>;
}

/** LP analytics 服務。 */
export class LpAnalyticsService {
  constructor(
    private readonly events: LpEventStore,
    private readonly spend: AdSpendStore,
    private readonly trackers: ExternalTracker[] = [],
  ) {}

  /** 記錄事件並 fan-out 給外掛追蹤器（失敗不影響本地紀錄）。 */
  async track(event: LpEvent): Promise<{ trackerFailures: string[] }> {
    if (event.event === 'Purchase' && (!event.valueMinor || !event.currency || !event.orderId)) {
      throw new Error('Purchase 事件必須含 valueMinor / currency / orderId');
    }
    await this.events.insert(event);
    const failures: string[] = [];
    await Promise.all(
      this.trackers.map(async (t) => {
        try {
          await t.send(event);
        } catch {
          failures.push(t.name);
        }
      }),
    );
    return { trackerFailures: failures };
  }

  /** 漏斗轉換率：每階段去重 visitor。 */
  async funnel(
    tenantId: string,
    pageId: string,
    range?: { from?: Date; to?: Date },
  ): Promise<FunnelStepStats[]> {
    const events = await this.events.listByPage(tenantId, pageId, range);
    const byEvent = new Map<LpEventName, Set<string>>();
    for (const e of events) {
      let set = byEvent.get(e.event);
      if (!set) {
        set = new Set();
        byEvent.set(e.event, set);
      }
      set.add(e.visitorId);
    }
    const result: FunnelStepStats[] = [];
    const baseVisitors = byEvent.get('PageView')?.size ?? 0;
    let prev: number | undefined;
    for (const name of FUNNEL_ORDER) {
      const count = byEvent.get(name)?.size ?? 0;
      const stepRate = prev === undefined || prev === 0 ? 1 : count / prev;
      const overallRate = baseVisitors === 0 ? 0 : count / baseVisitors;
      result.push({
        event: name,
        uniqueVisitors: count,
        stepConversionRate: prev === undefined ? 1 : stepRate,
        overallConversionRate: name === 'PageView' ? 1 : overallRate,
      });
      prev = count;
    }
    return result;
  }

  /** 來源彙整 + 對應 ad spend → ROAS / CPA。 */
  async sourceReport(
    tenantId: string,
    pageId: string,
    range?: { from?: Date; to?: Date },
  ): Promise<SourceStats[]> {
    const events = await this.events.listByPage(tenantId, pageId, range);
    const spendList = await this.spend.listByPage(tenantId, pageId);
    const groups = new Map<
      string,
      {
        source: string;
        medium: string;
        campaign: string;
        visitors: Set<string>;
        purchases: number;
        revenueMinor: number;
      }
    >();
    for (const e of events) {
      const source = e.utm?.source ?? '(direct)';
      const medium = e.utm?.medium ?? '(none)';
      const campaign = e.utm?.campaign ?? '(none)';
      const k = `${source}|${medium}|${campaign}`;
      let g = groups.get(k);
      if (!g) {
        g = { source, medium, campaign, visitors: new Set(), purchases: 0, revenueMinor: 0 };
        groups.set(k, g);
      }
      if (e.event === 'PageView') g.visitors.add(e.visitorId);
      if (e.event === 'Purchase') {
        g.purchases += 1;
        g.revenueMinor += e.valueMinor ?? 0;
      }
    }
    const spendByCampaign = new Map<string, number>();
    for (const s of spendList) {
      spendByCampaign.set(s.campaign, (spendByCampaign.get(s.campaign) ?? 0) + s.spendMinor);
    }
    return Array.from(groups.values()).map((g) => {
      const spendMinor = spendByCampaign.get(g.campaign) ?? 0;
      const visitors = g.visitors.size;
      const conversionRate = visitors === 0 ? 0 : g.purchases / visitors;
      const roas = spendMinor === 0 ? Infinity : g.revenueMinor / spendMinor;
      const cpaMinor = g.purchases === 0 ? Infinity : spendMinor / g.purchases;
      return {
        source: g.source,
        medium: g.medium,
        campaign: g.campaign,
        visitors,
        purchases: g.purchases,
        conversionRate,
        revenueMinor: g.revenueMinor,
        spendMinor,
        roas,
        cpaMinor,
      };
    });
  }

  /** 後台輸入廣告花費。 */
  async recordAdSpend(entry: Parameters<AdSpendStore['upsert']>[0]): Promise<void> {
    await this.spend.upsert(entry);
  }
}
