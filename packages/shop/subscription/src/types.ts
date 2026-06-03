/**
 * 訂閱型別（goal 03 §12）。
 */

/**
 * 訂閱頻率。
 */
export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';

/**
 * 訂閱狀態。
 */
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'past-due';

/**
 * 訂閱項目（每個 variant 一筆）。
 */
export interface SubscriptionItem {
  variantId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

/**
 * 訂閱記錄。
 */
export interface Subscription {
  id: string;
  tenantId: string;
  userId: string;
  items: SubscriptionItem[];
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  /** 配送地址（自助可改）。 */
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city?: string;
    postalCode?: string;
  };
  /** 付款卡 token（payment-core 寫入）。 */
  paymentToken: string;
  /** 卡片到期 yyyy-mm。 */
  cardExpiresAt: string;
  /** 訂閱折扣百分比（0-100）。 */
  discountPercentage?: number;
  /** 下次出貨時間。 */
  nextRunAt: string;
  /** 暫停到何時。 */
  pausedUntil?: string;
  /** 失敗重試次數。 */
  failureCount: number;
  /** 最後一次出貨訂單 id。 */
  lastOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 儲存層介面。
 */
export interface SubscriptionStore {
  get(id: string): Promise<Subscription | null>;
  save(sub: Subscription): Promise<void>;
  listDue(tenantId: string, now: Date): Promise<Subscription[]>;
  listExpiringCards(tenantId: string, withinDays: number, now: Date): Promise<Subscription[]>;
}
