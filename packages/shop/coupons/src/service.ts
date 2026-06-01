/**
 * 優惠券服務。
 */


import { generateBulkCodes } from './code-generator.js';

import type {
  BulkGenerateOptions,
  Coupon,
  CouponCode,
  CouponStore,
  RedeemResult,
} from './types.js';
import type { DiscountRule } from '@saas-factory/shop-discount-engine';

/**
 * 優惠券服務，協調 auto / code / bulk 三種發放模式。
 */
export class CouponService {
  constructor(private readonly store: CouponStore) {}

  /**
   * 取出當前可自動套用到 cart 的優惠券對應折扣規則。
   *
   * 結帳時呼叫，將回傳的規則一併丟給 DiscountEngine.apply()。
   */
  async getAutoApplyRules(tenantId: string): Promise<DiscountRule[]> {
    const coupons = await this.store.listAutoCoupons(tenantId);
    return coupons
      .filter((c) => c.active && c.mode === 'auto')
      .map((c) => couponToRule(c));
  }

  /**
   * 使用者手動輸入 code 兌換（mode === 'code' 或 'bulk'）。
   *
   * 回傳對應 Coupon + DiscountRule 給結帳流程使用。
   */
  async redeem(
    code: string,
    userId?: string,
  ): Promise<RedeemResult & { rule?: DiscountRule }> {
    const codeRow = await this.store.getCouponCode(code);
    if (codeRow) {
      return this.redeemBulkCode(codeRow, userId);
    }
    const coupon = await this.store.getCouponByCode(code);
    if (!coupon) return { ok: false, reason: 'not_found' };
    return this.redeemSingleCode(coupon);
  }

  /**
   * 將 redeem 成功的優惠券標記為已使用（結帳成功後呼叫）。
   */
  async markRedeemed(coupon: Coupon, codeRow: CouponCode | undefined, userId: string, orderId: string): Promise<void> {
    if (codeRow) {
      await this.store.markCouponCodeRedeemed(codeRow.id, userId, orderId);
    }
    await this.store.incrementCouponUsage(coupon.id);
  }

  /**
   * 大量產生 code 並儲存。
   */
  async generateBulk(
    coupon: Coupon,
    options: BulkGenerateOptions,
  ): Promise<CouponCode[]> {
    if (coupon.mode !== 'bulk') {
      throw new Error('優惠券非 bulk 模式');
    }
    const codes = generateBulkCodes(options);
    const now = new Date().toISOString();
    const rows: CouponCode[] = codes.map((c) => ({
      id: `${coupon.id}-${c}-${now}`,
      couponId: coupon.id,
      code: c,
      active: true,
    }));
    await this.store.saveCouponCodes(rows);
    return rows;
  }

  private async redeemBulkCode(
    codeRow: CouponCode,
    userId?: string,
  ): Promise<RedeemResult & { rule?: DiscountRule }> {
    if (!codeRow.active) return { ok: false, reason: 'inactive' };
    if (codeRow.redeemedAt) return { ok: false, reason: 'already_redeemed' };
    if (codeRow.assignedUserId && codeRow.assignedUserId !== userId) {
      return { ok: false, reason: 'wrong_user' };
    }
    return this.completeRedeem(codeRow.couponId, codeRow);
  }

  private async redeemSingleCode(coupon: Coupon): Promise<RedeemResult & { rule?: DiscountRule }> {
    if (!coupon.active) return { ok: false, reason: 'inactive' };
    if (coupon.endsAt && new Date(coupon.endsAt).getTime() < Date.now()) {
      return { ok: false, reason: 'expired' };
    }
    if (coupon.totalUsageLimit != null && coupon.totalUsageCount >= coupon.totalUsageLimit) {
      return { ok: false, reason: 'usage_limit_reached' };
    }
    return { ok: true, coupon, rule: couponToRule(coupon) };
  }

  private async completeRedeem(
    couponId: string,
    codeRow: CouponCode,
  ): Promise<RedeemResult & { rule?: DiscountRule }> {
    const coupon = await this.store.getCoupon(couponId);
    if (!coupon || !coupon.active) return { ok: false, reason: 'inactive' };
    if (coupon.endsAt && new Date(coupon.endsAt).getTime() < Date.now()) {
      return { ok: false, reason: 'expired' };
    }
    return { ok: true, coupon, couponCode: codeRow, rule: couponToRule(coupon) };
  }
}

/**
 * 將 Coupon 轉成 DiscountRule（注入 coupon.id 當 rule.id）。
 */
export function couponToRule(coupon: Coupon): DiscountRule {
  return {
    ...coupon.rule,
    id: coupon.id,
    tenantId: coupon.tenantId,
    usedCount: coupon.totalUsageCount,
    maxUses: coupon.totalUsageLimit,
    active: coupon.active,
    startsAt: coupon.startsAt,
    endsAt: coupon.endsAt,
  };
}
