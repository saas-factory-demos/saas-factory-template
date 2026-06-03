/**
 * 測試用 in-memory store。
 */

import type { Coupon, CouponCode, CouponStore } from './types.js';

/**
 * 記憶體儲存實作，供 vitest 與本機開發使用。
 */
export class InMemoryCouponStore implements CouponStore {
  private coupons = new Map<string, Coupon>();
  private codes = new Map<string, CouponCode>();

  async getCoupon(id: string): Promise<Coupon | null> {
    return this.coupons.get(id) ?? null;
  }

  async getCouponByCode(code: string): Promise<Coupon | null> {
    for (const c of this.coupons.values()) {
      if (c.code === code) return c;
    }
    return null;
  }

  async getCouponCode(code: string): Promise<CouponCode | null> {
    for (const c of this.codes.values()) {
      if (c.code === code) return c;
    }
    return null;
  }

  async listAutoCoupons(tenantId: string): Promise<Coupon[]> {
    return Array.from(this.coupons.values()).filter(
      (c) => c.tenantId === tenantId && c.mode === 'auto',
    );
  }

  async saveCoupon(coupon: Coupon): Promise<void> {
    this.coupons.set(coupon.id, coupon);
  }

  async saveCouponCodes(codes: CouponCode[]): Promise<void> {
    for (const c of codes) this.codes.set(c.id, c);
  }

  async markCouponCodeRedeemed(codeId: string, userId: string, orderId: string): Promise<void> {
    const c = this.codes.get(codeId);
    if (!c) return;
    c.redeemedAt = new Date().toISOString();
    c.redeemedByUserId = userId;
    c.redeemedOrderId = orderId;
  }

  async incrementCouponUsage(couponId: string): Promise<void> {
    const c = this.coupons.get(couponId);
    if (!c) return;
    c.totalUsageCount += 1;
  }
}
