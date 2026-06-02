import { randomBytes } from 'node:crypto';

import type { FlashSaleStore } from './in-memory-store.js';
import type { CountdownState, FlashDiscount, FlashSale } from './types.js';

/** 給定加購數與 tiers，回傳目前生效折扣 + 下一階段。 */
export function resolveCurrentDiscount(
  base: FlashDiscount,
  tiers: FlashSale['tiers'],
  addToCartCount: number,
): { current: FlashDiscount; next?: FlashSale['tiers'][number] } {
  const sorted = [...tiers].sort((a, b) => a.minCount - b.minCount);
  let current = base;
  let next: FlashSale['tiers'][number] | undefined;
  for (const t of sorted) {
    if (addToCartCount >= t.minCount) {
      current = t.discount;
    } else {
      next = next ?? t;
    }
  }
  return { current, next };
}

/** Flash sale 服務。 */
export class FlashSaleService {
  constructor(
    private readonly store: FlashSaleStore,
    private readonly options: { now?: () => Date; genId?: () => string } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(): string {
    if (this.options.genId) return this.options.genId();
    return `fs_${randomBytes(5).toString('hex')}`;
  }

  /** 建立活動。預設 scheduled，等 cron 切 active。 */
  async create(input: Omit<FlashSale, 'id' | 'status' | 'addToCartCount' | 'createdAt'>): Promise<FlashSale> {
    if (input.endAt <= input.startAt) throw new Error('endAt 必須晚於 startAt');
    const sale: FlashSale = {
      ...input,
      id: this.genId(),
      status: 'scheduled',
      addToCartCount: 0,
      createdAt: this.now(),
    };
    await this.store.insert(sale);
    return sale;
  }

  /** Cron：切換所有 tenant 活動的 scheduled → active → ended。 */
  async tickStatus(tenantId: string, now: Date = this.now()): Promise<FlashSale[]> {
    const list = await this.store.listByTenant(tenantId);
    const changed: FlashSale[] = [];
    for (const s of list) {
      if (s.status === 'scheduled' && now >= s.startAt && now < s.endAt) {
        const updated: FlashSale = { ...s, status: 'active' };
        await this.store.update(updated);
        changed.push(updated);
      } else if ((s.status === 'scheduled' || s.status === 'active') && now >= s.endAt) {
        const updated: FlashSale = { ...s, status: 'ended' };
        await this.store.update(updated);
        changed.push(updated);
      }
    }
    return changed;
  }

  /** 加購事件：對 active 活動 +1 計數。 */
  async incrementAddToCart(saleId: string, delta = 1): Promise<FlashSale> {
    const s = await this.store.findById(saleId);
    if (!s) throw new Error(`找不到 flash sale：${saleId}`);
    const updated: FlashSale = { ...s, addToCartCount: s.addToCartCount + delta };
    await this.store.update(updated);
    return updated;
  }

  /** 取得倒數狀態給前台 banner。 */
  async getCountdownState(saleId: string): Promise<CountdownState> {
    const s = await this.store.findById(saleId);
    if (!s) throw new Error(`找不到 flash sale：${saleId}`);
    const { current, next } = resolveCurrentDiscount(s.baseDiscount, s.tiers, s.addToCartCount);
    const countsDownTo = s.status === 'scheduled' ? s.startAt : s.endAt;
    return {
      saleId: s.id,
      status: s.status,
      countsDownTo,
      currentDiscount: current,
      nextTier: next,
      addToCartCount: s.addToCartCount,
    };
  }

  /** 判斷某商品是否在 sale 範圍內。 */
  matchesScope(sale: FlashSale, productId: string, categoryIds: string[]): boolean {
    if (sale.scope.kind === 'all') return true;
    if (sale.scope.kind === 'products') return sale.scope.productIds.includes(productId);
    return categoryIds.some((c) => sale.scope.kind === 'categories' && sale.scope.categoryIds.includes(c));
  }

  /** 取目前 tenant 所有 active sale。 */
  async listActive(tenantId: string, now: Date = this.now()): Promise<FlashSale[]> {
    return this.store.listActiveForTenant(tenantId, now);
  }
}
