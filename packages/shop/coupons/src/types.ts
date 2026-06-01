/**
 * 優惠券型別（goal 03 §6）。
 */

import type { DiscountRule } from '@saas-factory/shop-discount-engine';

/**
 * 優惠券發放模式。
 *
 * - `auto`：自動套用，符合條件即生效（無需輸入 code）。
 * - `code`：手動輸入單一 code 領取。
 * - `bulk`：大量產生獨立 code，每組僅可用一次或限定使用者。
 */
export type CouponMode = 'auto' | 'code' | 'bulk';

/**
 * 優惠券來源（用於分析）。
 */
export type CouponSource = 'campaign' | 'referral' | 'compensation' | 'subscription' | 'manual';

/**
 * 單一優惠券 code 實例（bulk 模式會產生多筆）。
 */
export interface CouponCode {
  id: string;
  couponId: string;
  code: string;
  /** 該 code 是否已被綁定到指定使用者。 */
  assignedUserId?: string;
  redeemedAt?: string;
  redeemedByUserId?: string;
  redeemedOrderId?: string;
  active: boolean;
}

/**
 * 優惠券主檔。
 *
 * 一張優惠券對應一筆折扣規則設定，再由 mode 決定如何發放。
 */
export interface Coupon {
  id: string;
  tenantId: string;
  /** 顯示名稱。 */
  name: string;
  /** 發放模式。 */
  mode: CouponMode;
  /** 來源分類。 */
  source: CouponSource;
  /** 對應折扣規則（直接複用 discount-engine）。 */
  rule: Omit<DiscountRule, 'id' | 'tenantId'>;
  /** code 模式時的單一 code（mode === 'code' 才有）。 */
  code?: string;
  /** 整張券的總可使用次數（mode === 'code' 才有意義）。 */
  totalUsageLimit?: number;
  /** 已使用次數（mode === 'code' 才有意義）。 */
  totalUsageCount: number;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
}

/**
 * 大量產生 code 設定。
 */
export interface BulkGenerateOptions {
  /** 產生數量。 */
  count: number;
  /** code 長度（不含 prefix）。 */
  length?: number;
  /** code 前綴，輸出格式為 `${prefix}-${random}`。 */
  prefix?: string;
  /** 字元集，預設 A-Z 0-9 去除易混淆字元（0/O/1/I）。 */
  charset?: string;
}

/**
 * 領券 / 兌換結果。
 */
export interface RedeemResult {
  ok: boolean;
  coupon?: Coupon;
  couponCode?: CouponCode;
  /** 失敗原因代碼。 */
  reason?:
    | 'not_found'
    | 'inactive'
    | 'expired'
    | 'already_redeemed'
    | 'usage_limit_reached'
    | 'wrong_user';
}

/**
 * 儲存層介面（in-memory 或 Payload 後台均可實作）。
 */
export interface CouponStore {
  getCoupon(id: string): Promise<Coupon | null>;
  getCouponByCode(code: string): Promise<Coupon | null>;
  getCouponCode(code: string): Promise<CouponCode | null>;
  listAutoCoupons(tenantId: string): Promise<Coupon[]>;
  saveCoupon(coupon: Coupon): Promise<void>;
  saveCouponCodes(codes: CouponCode[]): Promise<void>;
  markCouponCodeRedeemed(codeId: string, userId: string, orderId: string): Promise<void>;
  incrementCouponUsage(couponId: string): Promise<void>;
}
