/**
 * 評價服務。
 */

import type { Review, ReviewInvitation, ReviewStore } from './types.js';

export interface ReviewServiceConfig {
  now?: () => Date;
  idGenerator?: () => string;
  /** 出貨後幾天發送邀請。 */
  invitationDelayDays?: number;
}

/**
 * 評價服務：含已購買驗證 + 商家回覆 + 邀請排程。
 */
export class ReviewService {
  constructor(
    private readonly store: ReviewStore,
    private readonly config: ReviewServiceConfig = {},
  ) {}

  private now(): Date {
    return this.config.now?.() ?? new Date();
  }

  private genId(): string {
    return this.config.idGenerator?.() ?? `id-${this.now().getTime()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * 寫入評價。驗證購買 + 一單一評。
   */
  async submit(input: {
    tenantId: string;
    userId: string;
    orderId: string;
    productId: string;
    variantId?: string;
    rating: number;
    title?: string;
    body: string;
    photoUrls?: string[];
    videoUrls?: string[];
  }): Promise<Review> {
    if (input.rating < 1 || input.rating > 5) {
      throw new Error('rating 必須在 1-5');
    }
    const purchased = await this.store.hasPurchased(input.userId, input.productId, input.tenantId);
    if (!purchased) throw new Error('尚未購買該商品');
    const reviewed = await this.store.hasReviewed(input.userId, input.orderId, input.productId);
    if (reviewed) throw new Error('該訂單已對此商品評價過');

    const at = this.now().toISOString();
    const review: Review = {
      id: this.genId(),
      tenantId: input.tenantId,
      userId: input.userId,
      orderId: input.orderId,
      productId: input.productId,
      variantId: input.variantId,
      rating: input.rating,
      title: input.title,
      body: input.body,
      photoUrls: input.photoUrls,
      videoUrls: input.videoUrls,
      visible: true,
      createdAt: at,
      updatedAt: at,
    };
    await this.store.saveReview(review);
    return review;
  }

  /**
   * 商家回覆。
   */
  async reply(input: { reviewId: string; body: string; userId: string }): Promise<Review> {
    const review = await this.store.getReview(input.reviewId);
    if (!review) throw new Error('評價不存在');
    const at = this.now().toISOString();
    const updated: Review = {
      ...review,
      merchantReply: { body: input.body, repliedAt: at, repliedByUserId: input.userId },
      updatedAt: at,
    };
    await this.store.updateReview(updated);
    return updated;
  }

  /**
   * 後台上下架。
   */
  async setVisible(reviewId: string, visible: boolean): Promise<void> {
    const review = await this.store.getReview(reviewId);
    if (!review) return;
    review.visible = visible;
    review.updatedAt = this.now().toISOString();
    await this.store.updateReview(review);
  }

  /**
   * 出貨後排程邀請（由 order.shipped 事件觸發）。
   */
  async scheduleInvitation(input: {
    tenantId: string;
    userId: string;
    orderId: string;
    shippedAt: Date;
  }): Promise<ReviewInvitation> {
    const delay = (this.config.invitationDelayDays ?? 14) * 86400000;
    const scheduled = new Date(input.shippedAt.getTime() + delay);
    const inv: ReviewInvitation = {
      id: this.genId(),
      tenantId: input.tenantId,
      userId: input.userId,
      orderId: input.orderId,
      shippedAt: input.shippedAt.toISOString(),
      scheduledAt: scheduled.toISOString(),
      fulfilled: false,
    };
    await this.store.saveInvitation(inv);
    return inv;
  }

  /**
   * 取出到期但未發送的邀請（cron 呼叫）。
   */
  async listDueInvitations(tenantId: string): Promise<ReviewInvitation[]> {
    return this.store.listDueInvitations(this.now(), tenantId);
  }

  /**
   * 取得商品的可見評價（給商品頁與結帳頁顯示）。
   */
  async listProductReviews(input: {
    tenantId: string;
    productId: string;
    limit?: number;
  }): Promise<Review[]> {
    return this.store.listProductReviews(input.tenantId, input.productId, {
      limit: input.limit,
      visibleOnly: true,
    });
  }
}
