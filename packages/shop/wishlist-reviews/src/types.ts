/**
 * 願望清單 + 評價型別（goal 03 §10）。
 */

// ===== 願望清單 =====

/**
 * 願望清單（每使用者可有多份命名清單）。
 */
export interface Wishlist {
  id: string;
  userId: string;
  tenantId: string;
  name: string;
  /** 是否為預設（一份），刪不掉。 */
  isDefault: boolean;
  createdAt: string;
}

/**
 * 願望清單項目。
 */
export interface WishlistItem {
  id: string;
  wishlistId: string;
  variantId: string;
  productId: string;
  addedAt: string;
  note?: string;
}

/**
 * 願望清單儲存層介面。
 */
export interface WishlistStore {
  listWishlists(userId: string, tenantId: string): Promise<Wishlist[]>;
  getWishlist(id: string): Promise<Wishlist | null>;
  saveWishlist(list: Wishlist): Promise<void>;
  deleteWishlist(id: string): Promise<void>;
  listItems(wishlistId: string): Promise<WishlistItem[]>;
  saveItem(item: WishlistItem): Promise<void>;
  deleteItem(itemId: string): Promise<void>;
  findItem(wishlistId: string, variantId: string): Promise<WishlistItem | null>;
}

// ===== 評價 =====

/**
 * 評價（每訂單每商品最多一筆）。
 */
export interface Review {
  id: string;
  tenantId: string;
  userId: string;
  /** 已購買的訂單 id。 */
  orderId: string;
  productId: string;
  variantId?: string;
  /** 1-5 星。 */
  rating: number;
  title?: string;
  body: string;
  /** 圖片 URL list。 */
  photoUrls?: string[];
  /** 影片 URL list。 */
  videoUrls?: string[];
  /** 商家回覆。 */
  merchantReply?: {
    body: string;
    repliedAt: string;
    repliedByUserId: string;
  };
  /** 是否公開（後台可下架）。 */
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 評價邀請（出貨 14 天後自動發送）。
 */
export interface ReviewInvitation {
  id: string;
  tenantId: string;
  userId: string;
  orderId: string;
  /** 出貨時間。 */
  shippedAt: string;
  /** 預定寄出時間（shippedAt + 14 天）。 */
  scheduledAt: string;
  sentAt?: string;
  /** 是否完成回填評價。 */
  fulfilled: boolean;
}

/**
 * 評價儲存層介面。
 */
export interface ReviewStore {
  /** 檢查某使用者是否購買過此 product（防灌水）。 */
  hasPurchased(userId: string, productId: string, tenantId: string): Promise<boolean>;
  /** 檢查某訂單已對某 product 寫過評價。 */
  hasReviewed(userId: string, orderId: string, productId: string): Promise<boolean>;
  saveReview(review: Review): Promise<void>;
  updateReview(review: Review): Promise<void>;
  getReview(id: string): Promise<Review | null>;
  listProductReviews(
    tenantId: string,
    productId: string,
    options?: { limit?: number; visibleOnly?: boolean },
  ): Promise<Review[]>;
  saveInvitation(inv: ReviewInvitation): Promise<void>;
  listDueInvitations(now: Date, tenantId: string): Promise<ReviewInvitation[]>;
}
