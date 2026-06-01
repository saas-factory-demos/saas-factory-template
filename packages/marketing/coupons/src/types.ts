/** 折扣型態。 */
export type DiscountKind =
  | { kind: 'percent'; rate: number } // rate 0-1
  | { kind: 'fixed'; amountMinor: number }
  | { kind: 'free-shipping' };

/** Coupon batch：一次活動的設定容器。 */
export interface CouponBatch {
  id: string;
  tenantId: string;
  name: string;
  discount: DiscountKind;
  /** 批量產生的張數（單張個人碼也包進 batch）。 */
  quantity: number;
  /** 每張碼最多可使用幾次。1 = 一次性。 */
  maxUsesPerCode: number;
  /** 整個 batch 全域上限（防衝量）。 */
  maxTotalUses?: number;
  /** 最低訂單金額才能使用。 */
  minOrderAmountMinor?: number;
  /** 限定客戶 id（個人專屬碼用）。 */
  restrictedToCustomerId?: string;
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
  status: 'active' | 'paused' | 'expired';
}

/** 單張優惠券碼。 */
export interface CouponCode {
  code: string;
  batchId: string;
  tenantId: string;
  /** 已使用次數。 */
  usedCount: number;
  /** 個人專屬碼指定客戶。 */
  assignedCustomerId?: string;
  /** 來源：手動建立 / 批次產生 / 自動發券。 */
  source: 'manual' | 'batch' | 'auto-issue';
  /** 已寄送（給到期提醒用）。 */
  notifiedExpiryAt?: Date;
}

/** 一次使用紀錄。 */
export interface CouponRedemption {
  id: string;
  tenantId: string;
  code: string;
  batchId: string;
  customerId: string;
  orderId: string;
  /** 此次的折抵金額（minor）。 */
  discountAmountMinor: number;
  /** 訂單原始金額。 */
  orderAmountMinor: number;
  at: Date;
}

/** Batch 統計報表。 */
export interface BatchStats {
  batchId: string;
  totalCodes: number;
  issuedCodes: number;
  redeemedCount: number;
  /** 累計折抵總額。 */
  totalDiscountMinor: number;
  /** 帶來的訂單原始金額。 */
  totalRevenueMinor: number;
  /** 兌換率（redeemedCount / issuedCodes）。 */
  conversionRate: number;
}

/** validateCoupon 回傳。 */
export type ValidateResult =
  | { ok: true; batch: CouponBatch; code: CouponCode; discountAmountMinor: number }
  | { ok: false; reason: ValidateFailReason };

export type ValidateFailReason =
  | 'code-not-found'
  | 'batch-not-active'
  | 'before-valid-from'
  | 'after-valid-until'
  | 'max-uses-reached'
  | 'batch-total-cap-reached'
  | 'min-order-not-met'
  | 'not-assigned-customer';
