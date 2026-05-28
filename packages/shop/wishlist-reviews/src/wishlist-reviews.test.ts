import { describe, expect, it } from 'vitest';

import { InMemoryReviewStore, InMemoryWishlistStore } from './in-memory-stores.js';
import { ReviewService } from './review-service.js';
import { WishlistService } from './wishlist-service.js';

describe('WishlistService', () => {
  it('預設清單自動建立', async () => {
    const service = new WishlistService(new InMemoryWishlistStore());
    const list = await service.getOrCreateDefault('u1', 't1');
    expect(list.isDefault).toBe(true);
    const same = await service.getOrCreateDefault('u1', 't1');
    expect(same.id).toBe(list.id);
  });

  it('加入相同 variant 不重複', async () => {
    const service = new WishlistService(new InMemoryWishlistStore());
    const list = await service.getOrCreateDefault('u1', 't1');
    const a = await service.addItem({ wishlistId: list.id, variantId: 'v1', productId: 'p1' });
    const b = await service.addItem({ wishlistId: list.id, variantId: 'v1', productId: 'p1' });
    expect(a.id).toBe(b.id);
    expect(await service.listItems(list.id)).toHaveLength(1);
  });

  it('預設清單不可刪除', async () => {
    const service = new WishlistService(new InMemoryWishlistStore());
    const list = await service.getOrCreateDefault('u1', 't1');
    await expect(service.deleteList(list.id)).rejects.toThrow('預設清單不可刪除');
  });
});

describe('ReviewService', () => {
  it('未購買不可評價', async () => {
    const store = new InMemoryReviewStore();
    const service = new ReviewService(store);
    await expect(
      service.submit({
        tenantId: 't1',
        userId: 'u1',
        orderId: 'o1',
        productId: 'p1',
        rating: 5,
        body: 'good',
      }),
    ).rejects.toThrow('尚未購買該商品');
  });

  it('購買後可評價且一單一評', async () => {
    const store = new InMemoryReviewStore();
    store.markPurchased('u1', 'p1', 't1');
    const service = new ReviewService(store);
    await service.submit({
      tenantId: 't1',
      userId: 'u1',
      orderId: 'o1',
      productId: 'p1',
      rating: 5,
      body: 'good',
    });
    await expect(
      service.submit({
        tenantId: 't1',
        userId: 'u1',
        orderId: 'o1',
        productId: 'p1',
        rating: 4,
        body: '又一篇',
      }),
    ).rejects.toThrow('該訂單已對此商品評價過');
  });

  it('rating 必須在 1-5', async () => {
    const store = new InMemoryReviewStore();
    store.markPurchased('u1', 'p1', 't1');
    const service = new ReviewService(store);
    await expect(
      service.submit({
        tenantId: 't1',
        userId: 'u1',
        orderId: 'o1',
        productId: 'p1',
        rating: 6,
        body: 'x',
      }),
    ).rejects.toThrow('rating 必須在 1-5');
  });

  it('商家回覆寫入 review', async () => {
    const store = new InMemoryReviewStore();
    store.markPurchased('u1', 'p1', 't1');
    const service = new ReviewService(store);
    const review = await service.submit({
      tenantId: 't1',
      userId: 'u1',
      orderId: 'o1',
      productId: 'p1',
      rating: 5,
      body: 'good',
    });
    const replied = await service.reply({
      reviewId: review.id,
      body: '感謝支持',
      userId: 'admin-1',
    });
    expect(replied.merchantReply?.body).toBe('感謝支持');
  });

  it('排程邀請：出貨 14 天後到期', async () => {
    const store = new InMemoryReviewStore();
    const now = new Date('2026-06-01T00:00:00Z');
    const service = new ReviewService(store, { now: () => now });
    await service.scheduleInvitation({
      tenantId: 't1',
      userId: 'u1',
      orderId: 'o1',
      shippedAt: new Date('2026-05-15T00:00:00Z'),
    });
    const due = await service.listDueInvitations('t1');
    expect(due).toHaveLength(1);
  });

  it('只回傳可見評價', async () => {
    const store = new InMemoryReviewStore();
    store.markPurchased('u1', 'p1', 't1');
    const service = new ReviewService(store);
    const r1 = await service.submit({
      tenantId: 't1',
      userId: 'u1',
      orderId: 'o1',
      productId: 'p1',
      rating: 5,
      body: 'visible',
    });
    await service.setVisible(r1.id, false);
    const list = await service.listProductReviews({ tenantId: 't1', productId: 'p1' });
    expect(list).toHaveLength(0);
  });
});
