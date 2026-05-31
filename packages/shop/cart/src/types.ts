/**
 * 購物車模組型別（goal 03 §3）。
 *
 * Lock：ADR-0011 §03-03 v1。
 */

/**
 * 購物車項目。
 */
export interface CartItem {
  /** 商品 SKU id。 */
  variantId: string;
  /** 商品 id。 */
  productId: string;
  /** 數量。 */
  quantity: number;
  /** 加入時的單價快照（避免後續調價影響購物車）。 */
  unitPrice: number;
  /** 加入時間 UNIX ms。 */
  addedAt: number;
  /** 已折扣金額（discount engine 計算後填入）。 */
  discountAmount?: number;
}

/**
 * 購物車。
 */
export interface Cart {
  id: string;
  tenantId: string;
  /** 已登入時 userId，未登入時 null。 */
  userId: string | null;
  /** 匿名 sessionId（cookie）。 */
  sessionId: string;
  items: CartItem[];
  /** 建立時間。 */
  createdAt: number;
  /** 最後更新時間。 */
  updatedAt: number;
  currency: string;
}

/**
 * 滿額免運門檻設定。
 */
export interface FreeShippingThreshold {
  /** 達到此金額免運。 */
  amount: number;
  /** 限定貨幣，例如 TWD。 */
  currency: string;
}

/**
 * 滿額免運進度。
 */
export interface FreeShippingProgress {
  /** 是否已達門檻。 */
  reached: boolean;
  /** 距離免運還差多少金額。 */
  remaining: number;
  /** 達成比例 0 ～ 1。 */
  progress: number;
}

/**
 * 購物車儲存抽象。
 */
export interface CartStore {
  get(cartId: string): Promise<Cart | null>;
  getByUserId(userId: string, tenantId: string): Promise<Cart | null>;
  getBySessionId(sessionId: string, tenantId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
  delete(cartId: string): Promise<void>;
}

/**
 * 商品狀態查詢（檢查下架 / 缺貨）。
 */
export interface ProductStatusChecker {
  /** 回傳 variantId 對應的可用庫存；不存在或下架回 0。 */
  getAvailable(variantId: string): Promise<number>;
}

/**
 * 購物車最久保留天數：30 天。
 */
export const CART_RETENTION_DAYS = 30;
