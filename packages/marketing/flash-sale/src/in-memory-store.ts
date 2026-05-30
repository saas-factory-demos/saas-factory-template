import type { FlashSale } from './types.js';

export interface FlashSaleStore {
  insert(s: FlashSale): Promise<void>;
  update(s: FlashSale): Promise<void>;
  findById(id: string): Promise<FlashSale | undefined>;
  listByTenant(tenantId: string): Promise<FlashSale[]>;
  listActiveForTenant(tenantId: string, now: Date): Promise<FlashSale[]>;
}

export class InMemoryFlashSaleStore implements FlashSaleStore {
  private map = new Map<string, FlashSale>();
  async insert(s: FlashSale): Promise<void> {
    if (this.map.has(s.id)) throw new Error(`flash sale 已存在：${s.id}`);
    this.map.set(s.id, s);
  }
  async update(s: FlashSale): Promise<void> {
    if (!this.map.has(s.id)) throw new Error(`flash sale 不存在：${s.id}`);
    this.map.set(s.id, s);
  }
  async findById(id: string): Promise<FlashSale | undefined> {
    return this.map.get(id);
  }
  async listByTenant(tenantId: string): Promise<FlashSale[]> {
    return Array.from(this.map.values()).filter((s) => s.tenantId === tenantId);
  }
  async listActiveForTenant(tenantId: string, now: Date): Promise<FlashSale[]> {
    return Array.from(this.map.values()).filter(
      (s) => s.tenantId === tenantId && s.status === 'active' && s.startAt <= now && s.endAt > now,
    );
  }
}
