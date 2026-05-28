import { randomBytes } from 'node:crypto';

import type {
  AffiliateStore,
  AttributionStore,
  CommissionStore,
  PayoutStore,
} from './in-memory-store.js';
import type {
  Affiliate,
  AffiliateAttribution,
  AffiliateStats,
  Commission,
  CommissionPolicy,
  Payout,
} from './types.js';

const DAY = 24 * 60 * 60 * 1000;

/** 聯盟分潤服務。 */
export class AffiliateService {
  constructor(
    private readonly affiliates: AffiliateStore,
    private readonly attributions: AttributionStore,
    private readonly commissions: CommissionStore,
    private readonly payouts: PayoutStore,
    private readonly policy: CommissionPolicy,
    private readonly options: { now?: () => Date; genId?: () => string } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(prefix: string): string {
    if (this.options.genId) return this.options.genId();
    return `${prefix}_${randomBytes(5).toString('hex')}`;
  }

  /** 註冊推薦人。code 由呼叫端決定（建議 6-8 字短碼）。 */
  async register(input: {
    tenantId: string;
    code: string;
    customerId?: string;
    parentAffiliateId?: string;
  }): Promise<Affiliate> {
    const exists = await this.affiliates.findByCode(input.tenantId, input.code);
    if (exists) throw new Error(`推薦碼已存在：${input.code}`);
    const a: Affiliate = {
      id: this.genId('aff'),
      tenantId: input.tenantId,
      code: input.code,
      customerId: input.customerId,
      parentAffiliateId: input.parentAffiliateId,
      status: 'active',
      createdAt: this.now(),
    };
    await this.affiliates.insert(a);
    return a;
  }

  /** 訂單成立時呼叫：依推薦碼建立歸因 + 預扣 pending commission。 */
  async attributeOrder(input: {
    tenantId: string;
    orderId: string;
    code: string;
    orderAmountMinor: number;
    customerId?: string;
    ip?: string;
    at: Date;
  }): Promise<{ attribution: AffiliateAttribution; commissions: Commission[] }> {
    const affiliate = await this.affiliates.findByCode(input.tenantId, input.code);
    if (!affiliate) throw new Error(`找不到推薦碼：${input.code}`);
    if (affiliate.status !== 'active') throw new Error(`affiliate 已停用：${affiliate.id}`);
    const isSelfReferral = !!input.customerId && input.customerId === affiliate.customerId;

    const attribution: AffiliateAttribution = {
      orderId: input.orderId,
      tenantId: input.tenantId,
      affiliateId: affiliate.id,
      orderAmountMinor: input.orderAmountMinor,
      customerId: input.customerId,
      ip: input.ip,
      at: input.at,
    };
    await this.attributions.insert(attribution);

    if (isSelfReferral) {
      // 自推自不發 commission
      return { attribution, commissions: [] };
    }

    const releaseAt = new Date(input.at.getTime() + this.policy.holdDays * DAY);
    const list: Commission[] = [];
    const l1: Commission = {
      id: this.genId('cm'),
      tenantId: input.tenantId,
      affiliateId: affiliate.id,
      orderId: input.orderId,
      level: 1,
      amountMinor: Math.round(input.orderAmountMinor * this.policy.level1Rate),
      status: 'pending',
      createdAt: this.now(),
      releaseAt,
    };
    await this.commissions.insert(l1);
    list.push(l1);

    if (
      this.policy.multiLevelEnabled &&
      this.policy.level2Rate &&
      affiliate.parentAffiliateId
    ) {
      const l2: Commission = {
        id: this.genId('cm'),
        tenantId: input.tenantId,
        affiliateId: affiliate.parentAffiliateId,
        orderId: input.orderId,
        level: 2,
        amountMinor: Math.round(input.orderAmountMinor * this.policy.level2Rate),
        status: 'pending',
        createdAt: this.now(),
        releaseAt,
      };
      await this.commissions.insert(l2);
      list.push(l2);
    }
    return { attribution, commissions: list };
  }

  /** Cron：將 hold 期已過的 pending commission 轉為 approved。 */
  async approveDueCommissions(tenantId: string, now: Date = this.now()): Promise<Commission[]> {
    const due = await this.commissions.listDueForApproval(tenantId, now);
    const out: Commission[] = [];
    for (const c of due) {
      const updated: Commission = { ...c, status: 'approved' };
      await this.commissions.update(updated);
      out.push(updated);
    }
    return out;
  }

  /** 訂單退款時呼叫：將該訂單尚未結算出去的 commission 改為 clawback。
   *  已綁定到「已支付」payout 的 commission 不可回扣（錢已匯出，需另走人工調整流程）。 */
  async clawbackOrder(orderId: string): Promise<Commission[]> {
    const list = await this.commissions.listByOrder(orderId);
    const out: Commission[] = [];
    for (const c of list) {
      if (c.status === 'clawback' || c.status === 'void') continue;
      if (c.payoutId) {
        const payout = await this.payouts.findById(c.payoutId);
        if (payout?.status === 'paid') continue;
      }
      const updated: Commission = { ...c, status: 'clawback' };
      await this.commissions.update(updated);
      out.push(updated);
    }
    return out;
  }

  /** 月結：建立 payout draft 將該月所有 approved 未付的 commission 綁定。 */
  async createMonthlyPayout(input: {
    tenantId: string;
    affiliateId: string;
    yearMonth: string;
  }): Promise<Payout> {
    const approved = await this.commissions.listApprovedUnpaid(
      input.tenantId,
      input.affiliateId,
    );
    const total = approved.reduce((s, c) => s + c.amountMinor, 0);
    const payout: Payout = {
      id: this.genId('po'),
      tenantId: input.tenantId,
      affiliateId: input.affiliateId,
      periodYearMonth: input.yearMonth,
      totalAmountMinor: total,
      status: 'draft',
      createdAt: this.now(),
    };
    await this.payouts.insert(payout);
    for (const c of approved) {
      await this.commissions.update({ ...c, payoutId: payout.id });
    }
    return payout;
  }

  /** 推薦人申請提領（draft → requested）。 */
  async requestPayout(payoutId: string): Promise<Payout> {
    const p = await this.payouts.findById(payoutId);
    if (!p) throw new Error(`找不到 payout：${payoutId}`);
    if (p.status !== 'draft') throw new Error(`payout 狀態錯誤：${p.status}`);
    const updated: Payout = { ...p, status: 'requested' };
    await this.payouts.update(updated);
    return updated;
  }

  /** 標記已撥款。 */
  async markPaid(payoutId: string): Promise<Payout> {
    const p = await this.payouts.findById(payoutId);
    if (!p) throw new Error(`找不到 payout：${payoutId}`);
    if (p.status !== 'requested') throw new Error(`payout 狀態錯誤：${p.status}`);
    const updated: Payout = { ...p, status: 'paid', paidAt: this.now() };
    await this.payouts.update(updated);
    return updated;
  }

  /** 取得推薦人累計統計。 */
  async getStats(tenantId: string, affiliateId: string): Promise<AffiliateStats> {
    const list = await this.commissions.listByAffiliate(tenantId, affiliateId);
    let pending = 0;
    let approved = 0;
    let paid = 0;
    let revenue = 0;
    const orderIds = new Set<string>();
    for (const c of list) {
      orderIds.add(c.orderId);
      if (c.status === 'pending') pending += c.amountMinor;
      else if (c.status === 'approved') approved += c.amountMinor;
    }
    const payouts = await this.payouts.listByAffiliate(tenantId, affiliateId);
    for (const p of payouts) {
      if (p.status === 'paid') paid += p.totalAmountMinor;
    }
    for (const orderId of orderIds) {
      const att = await this.attributions.findByOrder(orderId);
      if (att) revenue += att.orderAmountMinor;
    }
    return {
      affiliateId,
      totalOrders: orderIds.size,
      totalRevenueMinor: revenue,
      pendingCommissionMinor: pending,
      approvedCommissionMinor: approved,
      paidCommissionMinor: paid,
    };
  }
}
