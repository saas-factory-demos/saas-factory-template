import { randomBytes } from 'node:crypto';

import type {
  BannerStore,
  ClickStore,
  ImpressionStore,
} from './in-memory-store.js';
import type { Banner, BannerSlot, BannerStats } from './types.js';

/** 判斷 HH:mm 是否落在日內視窗。跨午夜（from > to）也支援。 */
export function inDayWindow(now: Date, window?: { from: string; to: string }): boolean {
  if (!window) return true;
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (window.from <= window.to) return hhmm >= window.from && hhmm < window.to;
  // 跨午夜，例：22:00-06:00
  return hhmm >= window.from || hhmm < window.to;
}

/** 過濾出當下可顯示的 banners。 */
export function filterEligible(banners: Banner[], now: Date): Banner[] {
  return banners.filter(
    (b) =>
      (b.status === 'active' || b.status === 'scheduled') &&
      now >= b.startAt &&
      now < b.endAt &&
      inDayWindow(now, b.dayWindow),
  );
}

/** 加權隨機挑一個（給 A/B 測試用）。`rand` 為 0-1。 */
export function pickWeighted<T extends { weight: number }>(items: T[], rand: number): T | undefined {
  if (items.length === 0) return undefined;
  const total = items.reduce((s, i) => s + Math.max(0, i.weight), 0);
  if (total <= 0) return items[0];
  let r = rand * total;
  for (const i of items) {
    r -= Math.max(0, i.weight);
    if (r <= 0) return i;
  }
  return items[items.length - 1];
}

/** Banner 服務。 */
export class BannerService {
  constructor(
    private readonly banners: BannerStore,
    private readonly impressions: ImpressionStore,
    private readonly clicks: ClickStore,
    private readonly options: { now?: () => Date; genId?: () => string; random?: () => number } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(): string {
    if (this.options.genId) return this.options.genId();
    return `bn_${randomBytes(5).toString('hex')}`;
  }

  private random(): number {
    return this.options.random ? this.options.random() : Math.random();
  }

  /** 建立 banner。 */
  async create(input: Omit<Banner, 'id' | 'status' | 'createdAt'>): Promise<Banner> {
    if (input.endAt <= input.startAt) throw new Error('endAt 必須晚於 startAt');
    if (input.weight < 0) throw new Error('weight 不可為負');
    const b: Banner = {
      ...input,
      id: this.genId(),
      status: 'scheduled',
      createdAt: this.now(),
    };
    await this.banners.insert(b);
    return b;
  }

  /** Cron：切換 scheduled → active → ended。 */
  async tickStatus(tenantId: string, now: Date = this.now()): Promise<Banner[]> {
    const list = await this.banners.listByTenant(tenantId);
    const changed: Banner[] = [];
    for (const b of list) {
      if (b.status === 'scheduled' && now >= b.startAt && now < b.endAt) {
        const updated = { ...b, status: 'active' as const };
        await this.banners.update(updated);
        changed.push(updated);
      } else if ((b.status === 'scheduled' || b.status === 'active') && now >= b.endAt) {
        const updated = { ...b, status: 'ended' as const };
        await this.banners.update(updated);
        changed.push(updated);
      }
    }
    return changed;
  }

  /** 取得某 slot 當下要顯示的 banner（含 A/B group 加權隨機）。 */
  async resolveActive(
    tenantId: string,
    slot: BannerSlot,
    now: Date = this.now(),
  ): Promise<Banner | undefined> {
    const list = await this.banners.listBySlot(tenantId, slot);
    const eligible = filterEligible(list, now);
    if (eligible.length === 0) return undefined;
    // 同 experimentGroup 一起加權；無 group 視為獨立池
    const grouped = new Map<string, Banner[]>();
    for (const b of eligible) {
      const k = b.experimentGroup ?? `__solo_${b.id}`;
      const arr = grouped.get(k) ?? [];
      arr.push(b);
      grouped.set(k, arr);
    }
    // 多 group 時取第一個 group（後台應該只有一個生效 group）
    const first = grouped.values().next().value;
    if (!first) return undefined;
    return pickWeighted(first, this.random());
  }

  /** 寫入曝光。 */
  async recordImpression(bannerId: string, visitorId?: string): Promise<void> {
    const b = await this.banners.findById(bannerId);
    if (!b) throw new Error(`找不到 banner：${bannerId}`);
    await this.impressions.insert({
      bannerId,
      tenantId: b.tenantId,
      at: this.now(),
      visitorId,
    });
  }

  /** 寫入點擊。 */
  async recordClick(bannerId: string, visitorId?: string): Promise<void> {
    const b = await this.banners.findById(bannerId);
    if (!b) throw new Error(`找不到 banner：${bannerId}`);
    await this.clicks.insert({
      bannerId,
      tenantId: b.tenantId,
      at: this.now(),
      visitorId,
    });
  }

  /** 取得 CTR 報表。 */
  async stats(bannerId: string): Promise<BannerStats> {
    const imp = await this.impressions.countByBanner(bannerId);
    const clk = await this.clicks.countByBanner(bannerId);
    return {
      bannerId,
      impressions: imp,
      clicks: clk,
      ctr: imp === 0 ? 0 : clk / imp,
    };
  }
}
