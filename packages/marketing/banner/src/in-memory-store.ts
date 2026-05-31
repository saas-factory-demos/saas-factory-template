import type { Banner, BannerClick, BannerImpression, BannerSlot } from './types.js';

export interface BannerStore {
  insert(b: Banner): Promise<void>;
  update(b: Banner): Promise<void>;
  findById(id: string): Promise<Banner | undefined>;
  listByTenant(tenantId: string): Promise<Banner[]>;
  listBySlot(tenantId: string, slot: BannerSlot): Promise<Banner[]>;
}

export interface ImpressionStore {
  insert(i: BannerImpression): Promise<void>;
  countByBanner(bannerId: string): Promise<number>;
}

export interface ClickStore {
  insert(c: BannerClick): Promise<void>;
  countByBanner(bannerId: string): Promise<number>;
}

export class InMemoryBannerStore implements BannerStore {
  private map = new Map<string, Banner>();
  async insert(b: Banner): Promise<void> {
    if (this.map.has(b.id)) throw new Error(`banner 已存在：${b.id}`);
    this.map.set(b.id, b);
  }
  async update(b: Banner): Promise<void> {
    if (!this.map.has(b.id)) throw new Error(`banner 不存在：${b.id}`);
    this.map.set(b.id, b);
  }
  async findById(id: string): Promise<Banner | undefined> {
    return this.map.get(id);
  }
  async listByTenant(tenantId: string): Promise<Banner[]> {
    return Array.from(this.map.values()).filter((b) => b.tenantId === tenantId);
  }
  async listBySlot(tenantId: string, slot: BannerSlot): Promise<Banner[]> {
    return Array.from(this.map.values()).filter(
      (b) => b.tenantId === tenantId && b.slot === slot,
    );
  }
}

export class InMemoryImpressionStore implements ImpressionStore {
  private list: BannerImpression[] = [];
  async insert(i: BannerImpression): Promise<void> {
    this.list.push(i);
  }
  async countByBanner(bannerId: string): Promise<number> {
    return this.list.filter((i) => i.bannerId === bannerId).length;
  }
}

export class InMemoryClickStore implements ClickStore {
  private list: BannerClick[] = [];
  async insert(c: BannerClick): Promise<void> {
    this.list.push(c);
  }
  async countByBanner(bannerId: string): Promise<number> {
    return this.list.filter((c) => c.bannerId === bannerId).length;
  }
}
