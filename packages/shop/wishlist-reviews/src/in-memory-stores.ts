/**
 * 測試用 in-memory stores。
 */

import type {
  Review,
  ReviewInvitation,
  ReviewStore,
  Wishlist,
  WishlistItem,
  WishlistStore,
} from './types.js';

export class InMemoryWishlistStore implements WishlistStore {
  lists = new Map<string, Wishlist>();
  items = new Map<string, WishlistItem>();

  async listWishlists(userId: string, tenantId: string): Promise<Wishlist[]> {
    return Array.from(this.lists.values()).filter(
      (l) => l.userId === userId && l.tenantId === tenantId,
    );
  }

  async getWishlist(id: string): Promise<Wishlist | null> {
    return this.lists.get(id) ?? null;
  }

  async saveWishlist(list: Wishlist): Promise<void> {
    this.lists.set(list.id, list);
  }

  async deleteWishlist(id: string): Promise<void> {
    this.lists.delete(id);
    for (const [k, v] of this.items) {
      if (v.wishlistId === id) this.items.delete(k);
    }
  }

  async listItems(wishlistId: string): Promise<WishlistItem[]> {
    return Array.from(this.items.values()).filter((i) => i.wishlistId === wishlistId);
  }

  async saveItem(item: WishlistItem): Promise<void> {
    this.items.set(item.id, item);
  }

  async deleteItem(itemId: string): Promise<void> {
    this.items.delete(itemId);
  }

  async findItem(wishlistId: string, variantId: string): Promise<WishlistItem | null> {
    for (const i of this.items.values()) {
      if (i.wishlistId === wishlistId && i.variantId === variantId) return i;
    }
    return null;
  }
}

export class InMemoryReviewStore implements ReviewStore {
  reviews = new Map<string, Review>();
  invitations = new Map<string, ReviewInvitation>();
  purchases = new Set<string>();
  reviewedKeys = new Set<string>();

  markPurchased(userId: string, productId: string, tenantId: string): void {
    this.purchases.add(`${tenantId}:${userId}:${productId}`);
  }

  async hasPurchased(userId: string, productId: string, tenantId: string): Promise<boolean> {
    return this.purchases.has(`${tenantId}:${userId}:${productId}`);
  }

  async hasReviewed(userId: string, orderId: string, productId: string): Promise<boolean> {
    return this.reviewedKeys.has(`${userId}:${orderId}:${productId}`);
  }

  async saveReview(review: Review): Promise<void> {
    this.reviews.set(review.id, review);
    this.reviewedKeys.add(`${review.userId}:${review.orderId}:${review.productId}`);
  }

  async updateReview(review: Review): Promise<void> {
    this.reviews.set(review.id, review);
  }

  async getReview(id: string): Promise<Review | null> {
    return this.reviews.get(id) ?? null;
  }

  async listProductReviews(
    tenantId: string,
    productId: string,
    options?: { limit?: number; visibleOnly?: boolean },
  ): Promise<Review[]> {
    let list = Array.from(this.reviews.values()).filter(
      (r) => r.tenantId === tenantId && r.productId === productId,
    );
    if (options?.visibleOnly) list = list.filter((r) => r.visible);
    if (options?.limit != null) list = list.slice(0, options.limit);
    return list;
  }

  async saveInvitation(inv: ReviewInvitation): Promise<void> {
    this.invitations.set(inv.id, inv);
  }

  async listDueInvitations(now: Date, tenantId: string): Promise<ReviewInvitation[]> {
    return Array.from(this.invitations.values()).filter(
      (i) =>
        i.tenantId === tenantId &&
        !i.sentAt &&
        new Date(i.scheduledAt).getTime() <= now.getTime(),
    );
  }
}
