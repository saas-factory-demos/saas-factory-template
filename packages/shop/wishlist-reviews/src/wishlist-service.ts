/**
 * 願望清單服務。
 */

import type { Wishlist, WishlistItem, WishlistStore } from './types.js';

export interface WishlistServiceConfig {
  now?: () => Date;
  idGenerator?: () => string;
}

export class WishlistService {
  constructor(
    private readonly store: WishlistStore,
    private readonly config: WishlistServiceConfig = {},
  ) {}

  private now(): Date {
    return this.config.now?.() ?? new Date();
  }

  private genId(): string {
    return this.config.idGenerator?.() ?? `id-${this.now().getTime()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * 取得使用者的預設清單，沒有時自動建立。
   */
  async getOrCreateDefault(userId: string, tenantId: string): Promise<Wishlist> {
    const lists = await this.store.listWishlists(userId, tenantId);
    const existing = lists.find((l) => l.isDefault);
    if (existing) return existing;
    const created: Wishlist = {
      id: this.genId(),
      userId,
      tenantId,
      name: '我的收藏',
      isDefault: true,
      createdAt: this.now().toISOString(),
    };
    await this.store.saveWishlist(created);
    return created;
  }

  /**
   * 建立新清單。
   */
  async createList(input: { userId: string; tenantId: string; name: string }): Promise<Wishlist> {
    const created: Wishlist = {
      id: this.genId(),
      userId: input.userId,
      tenantId: input.tenantId,
      name: input.name,
      isDefault: false,
      createdAt: this.now().toISOString(),
    };
    await this.store.saveWishlist(created);
    return created;
  }

  /**
   * 刪除非預設清單。
   */
  async deleteList(id: string): Promise<void> {
    const list = await this.store.getWishlist(id);
    if (!list) return;
    if (list.isDefault) throw new Error('預設清單不可刪除');
    await this.store.deleteWishlist(id);
  }

  /**
   * 加入商品到清單，若已存在則略過。
   */
  async addItem(input: {
    wishlistId: string;
    variantId: string;
    productId: string;
    note?: string;
  }): Promise<WishlistItem> {
    const existing = await this.store.findItem(input.wishlistId, input.variantId);
    if (existing) return existing;
    const item: WishlistItem = {
      id: this.genId(),
      wishlistId: input.wishlistId,
      variantId: input.variantId,
      productId: input.productId,
      addedAt: this.now().toISOString(),
      note: input.note,
    };
    await this.store.saveItem(item);
    return item;
  }

  async removeItem(itemId: string): Promise<void> {
    await this.store.deleteItem(itemId);
  }

  async listItems(wishlistId: string): Promise<WishlistItem[]> {
    return this.store.listItems(wishlistId);
  }
}
