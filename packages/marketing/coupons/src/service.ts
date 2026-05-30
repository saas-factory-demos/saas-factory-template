import { randomBytes, randomInt } from 'node:crypto';

import type {
  CouponBatchStore,
  CouponCodeStore,
  CouponRedemptionStore,
} from './in-memory-store.js';
import type {
  BatchStats,
  CouponBatch,
  CouponCode,
  CouponRedemption,
  DiscountKind,
  ValidateResult,
} from './types.js';

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 去除易混淆字元

/** 折扣計算純函式。 */
export function computeDiscount(
  discount: DiscountKind,
  orderAmountMinor: number,
  shippingMinor: number,
): number {
  switch (discount.kind) {
    case 'percent':
      return Math.round(orderAmountMinor * discount.rate);
    case 'fixed':
      return Math.min(orderAmountMinor, discount.amountMinor);
    case 'free-shipping':
      return shippingMinor;
  }
}

/** Coupon 服務：發券、驗證、兌換、統計。 */
export class CouponService {
  constructor(
    private readonly batches: CouponBatchStore,
    private readonly codes: CouponCodeStore,
    private readonly redemptions: CouponRedemptionStore,
    private readonly options: { now?: () => Date; genId?: () => string; genCode?: () => string } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(prefix: string): string {
    if (this.options.genId) return this.options.genId();
    return `${prefix}_${randomBytes(5).toString('hex')}`;
  }

  private genCode(): string {
    if (this.options.genCode) return this.options.genCode();
    // 用 crypto.randomInt（無 modulo bias）從 ALPHABET 抽 8 字，確保碼不可預測
    let s = '';
    for (let i = 0; i < 8; i++) s += ALPHABET[randomInt(ALPHABET.length)];
    return s;
  }

  /** 建立 batch（不一次產生碼，需呼叫 generateCodes）。 */
  async createBatch(input: Omit<CouponBatch, 'id' | 'createdAt' | 'status'>): Promise<CouponBatch> {
    const b: CouponBatch = {
      ...input,
      id: this.genId('bt'),
      createdAt: this.now(),
      status: 'active',
    };
    await this.batches.insert(b);
    return b;
  }

  /** 批量產生 N 張一次性碼，不重複。 */
  async generateCodes(batchId: string, count: number): Promise<CouponCode[]> {
    const b = await this.batches.findById(batchId);
    if (!b) throw new Error(`batch 不存在：${batchId}`);
    const existing = new Set((await this.codes.listByBatch(batchId)).map((c) => c.code));
    const out: CouponCode[] = [];
    let safety = 0;
    while (out.length < count) {
      if (++safety > count * 20) throw new Error('產碼碰撞過多');
      const code = this.genCode();
      if (existing.has(code)) continue;
      existing.add(code);
      const c: CouponCode = {
        code,
        batchId,
        tenantId: b.tenantId,
        usedCount: 0,
        source: 'batch',
      };
      await this.codes.insert(c);
      out.push(c);
    }
    return out;
  }

  /** 為單一客戶發個人專屬碼（自動發券 / 個人券都走這）。 */
  async issuePersonalCode(input: {
    batchId: string;
    customerId: string;
    source: CouponCode['source'];
    code?: string;
  }): Promise<CouponCode> {
    const b = await this.batches.findById(input.batchId);
    if (!b) throw new Error(`batch 不存在：${input.batchId}`);
    const code = input.code ?? this.genCode();
    const c: CouponCode = {
      code,
      batchId: input.batchId,
      tenantId: b.tenantId,
      usedCount: 0,
      assignedCustomerId: input.customerId,
      source: input.source,
    };
    await this.codes.insert(c);
    return c;
  }

  /** 驗證 + 計算折扣（不寫 redemption）。 */
  async validate(input: {
    tenantId: string;
    code: string;
    customerId: string;
    orderAmountMinor: number;
    shippingMinor: number;
    at: Date;
  }): Promise<ValidateResult> {
    const code = await this.codes.findByCode(input.tenantId, input.code);
    if (!code) return { ok: false, reason: 'code-not-found' };
    const batch = await this.batches.findById(code.batchId);
    if (!batch || batch.status !== 'active') return { ok: false, reason: 'batch-not-active' };
    if (input.at < batch.validFrom) return { ok: false, reason: 'before-valid-from' };
    if (input.at > batch.validUntil) return { ok: false, reason: 'after-valid-until' };
    if (code.usedCount >= batch.maxUsesPerCode) return { ok: false, reason: 'max-uses-reached' };
    if (
      batch.maxTotalUses !== undefined &&
      (await this.redemptions.listByBatch(batch.id)).length >= batch.maxTotalUses
    ) {
      return { ok: false, reason: 'batch-total-cap-reached' };
    }
    if (
      batch.minOrderAmountMinor !== undefined &&
      input.orderAmountMinor < batch.minOrderAmountMinor
    ) {
      return { ok: false, reason: 'min-order-not-met' };
    }
    if (
      code.assignedCustomerId &&
      code.assignedCustomerId !== input.customerId
    ) {
      return { ok: false, reason: 'not-assigned-customer' };
    }
    if (
      batch.restrictedToCustomerId &&
      batch.restrictedToCustomerId !== input.customerId
    ) {
      return { ok: false, reason: 'not-assigned-customer' };
    }
    const discountAmountMinor = computeDiscount(
      batch.discount,
      input.orderAmountMinor,
      input.shippingMinor,
    );
    return { ok: true, batch, code, discountAmountMinor };
  }

  /** 寫入兌換 + usedCount++。 */
  async redeem(input: {
    tenantId: string;
    code: string;
    customerId: string;
    orderId: string;
    orderAmountMinor: number;
    shippingMinor: number;
    at: Date;
  }): Promise<CouponRedemption> {
    const v = await this.validate(input);
    if (!v.ok) throw new Error(`coupon 不可用：${v.reason}`);
    const r: CouponRedemption = {
      id: this.genId('rd'),
      tenantId: input.tenantId,
      code: v.code.code,
      batchId: v.batch.id,
      customerId: input.customerId,
      orderId: input.orderId,
      discountAmountMinor: v.discountAmountMinor,
      orderAmountMinor: input.orderAmountMinor,
      at: input.at,
    };
    await this.redemptions.insert(r);
    await this.codes.update({ ...v.code, usedCount: v.code.usedCount + 1 });
    return r;
  }

  /** Batch 統計報表。 */
  async statsForBatch(batchId: string): Promise<BatchStats> {
    const codes = await this.codes.listByBatch(batchId);
    const reds = await this.redemptions.listByBatch(batchId);
    const totalDiscount = reds.reduce((s, r) => s + r.discountAmountMinor, 0);
    const totalRevenue = reds.reduce((s, r) => s + r.orderAmountMinor, 0);
    const issued = codes.length;
    return {
      batchId,
      totalCodes: codes.length,
      issuedCodes: issued,
      redeemedCount: reds.length,
      totalDiscountMinor: totalDiscount,
      totalRevenueMinor: totalRevenue,
      conversionRate: issued === 0 ? 0 : reds.length / issued,
    };
  }

  /** 找出 N 天內到期且未通知的個人碼（給 cron 寄提醒用）。 */
  async listCodesExpiringSoon(
    tenantId: string,
    daysAhead: number,
  ): Promise<Array<{ code: CouponCode; batch: CouponBatch }>> {
    const now = this.now();
    const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const batches = await this.batches.listByTenant(tenantId);
    const out: Array<{ code: CouponCode; batch: CouponBatch }> = [];
    for (const b of batches) {
      if (b.status !== 'active') continue;
      if (b.validUntil < now) continue;
      if (b.validUntil > cutoff) continue;
      const expiring = await this.codes.listExpiringInBatch(b.id, now);
      for (const c of expiring) {
        if (c.assignedCustomerId) out.push({ code: c, batch: b });
      }
    }
    return out;
  }

  /** 標記已發送到期提醒。 */
  async markNotified(tenantId: string, code: string): Promise<void> {
    const c = await this.codes.findByCode(tenantId, code);
    if (!c) throw new Error(`code 不存在：${code}`);
    await this.codes.update({ ...c, notifiedExpiryAt: this.now() });
  }
}
