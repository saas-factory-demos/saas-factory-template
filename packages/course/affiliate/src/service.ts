import { randomUUID } from 'node:crypto';

import type {
  Affiliate,
  AffiliateStore,
  CommissionLedgerEntry,
  CommissionPolicy,
  MonthlyPayoutSummary,
  OrderAttribution,
  PayeeRole,
} from './types.js';

export interface RecordOrderSplitInput {
  tenantId: string;
  orderId: string;
  courseId: string;
  /** 該課程講師 userId。 */
  instructorId: string;
  /** 訂單總金額（最小幣別單位）。 */
  amountMinor: number;
  /** 帶進來的 affiliate code（網址 ?ref=xxx，可選）。 */
  refCode?: string;
  /** 訂單成立時間。 */
  orderedAt: Date;
}

/**
 * 分潤 service：平台 vs 講師 vs L1/L2 affiliate，14 天 hold 後釋放可提領。
 *
 * 多層分潤預設 L2=0；開啟前請確認當地法規（台灣多層次傳銷管理法第 18 條）。
 */
export class AffiliateService {
  constructor(private readonly store: AffiliateStore) {}

  upsertPolicy(p: CommissionPolicy): Promise<void> {
    return this.store.upsertPolicy(p);
  }

  /** 註冊 affiliate（可指定推薦人，用來建立多層鏈）。 */
  async registerAffiliate(input: {
    tenantId: string;
    userId: string;
    code: string;
    referredByCode?: string;
    now?: Date;
  }): Promise<Affiliate> {
    let referredByAffiliateId: string | undefined;
    if (input.referredByCode) {
      const upline = await this.store.findAffiliateByCode(input.tenantId, input.referredByCode);
      if (upline) referredByAffiliateId = upline.id;
    }
    const a: Affiliate = {
      id: randomUUID(),
      tenantId: input.tenantId,
      userId: input.userId,
      code: input.code,
      referredByAffiliateId,
      active: true,
      createdAt: input.now ?? new Date(),
    };
    await this.store.upsertAffiliate(a);
    return a;
  }

  /** 訂單成立 → 寫 attribution + 拆分潤帳目（held 狀態）。 */
  async recordOrderSplit(input: RecordOrderSplitInput): Promise<CommissionLedgerEntry[]> {
    const policy = await this.resolvePolicy(input.tenantId, input.courseId);
    let l1Id: string | undefined;
    let l2Id: string | undefined;
    if (input.refCode) {
      const l1 = await this.store.findAffiliateByCode(input.tenantId, input.refCode);
      if (l1 && l1.active) {
        l1Id = l1.id;
        if (l1.referredByAffiliateId) {
          const l2 = await this.store.getAffiliate(l1.referredByAffiliateId);
          if (l2 && l2.active) l2Id = l2.id;
        }
      }
    }
    const attribution: OrderAttribution = {
      orderId: input.orderId,
      tenantId: input.tenantId,
      l1AffiliateId: l1Id,
      l2AffiliateId: l2Id,
      attributedAt: input.orderedAt,
    };
    await this.store.upsertAttribution(attribution);
    const releasesAt = new Date(input.orderedAt.getTime() + policy.holdDays * 86_400_000);
    const splits: Array<{ role: PayeeRole; payeeId: string; rate: number }> = [
      { role: 'platform', payeeId: 'platform', rate: policy.platformRate },
      { role: 'instructor', payeeId: input.instructorId, rate: policy.instructorRate },
    ];
    if (l1Id) splits.push({ role: 'affiliate-l1', payeeId: l1Id, rate: policy.affiliateL1Rate });
    if (l2Id) splits.push({ role: 'affiliate-l2', payeeId: l2Id, rate: policy.affiliateL2Rate });
    const entries: CommissionLedgerEntry[] = [];
    let allocated = 0;
    for (let i = 0; i < splits.length; i++) {
      const s = splits[i];
      if (!s) continue;
      const isLast = i === splits.length - 1;
      const amount = isLast ? input.amountMinor - allocated : Math.round(input.amountMinor * s.rate);
      allocated += amount;
      const entry: CommissionLedgerEntry = {
        id: randomUUID(),
        tenantId: input.tenantId,
        orderId: input.orderId,
        courseId: input.courseId,
        payeeRole: s.role,
        payeeId: s.payeeId,
        amountMinor: amount,
        status: 'held',
        orderedAt: input.orderedAt,
        releasesAt,
      };
      entries.push(entry);
      await this.store.appendLedger(entry);
    }
    return entries;
  }

  /** 退款 → 把該訂單所有 ledger entry 標為 reversed（衝銷）。 */
  async reverseOrder(orderId: string): Promise<void> {
    const entries = await this.store.listLedgerByOrder(orderId);
    for (const e of entries) {
      if (e.status === 'reversed') continue;
      await this.store.updateLedgerStatus(e.id, 'reversed');
    }
  }

  /** 結算：把 held 且超過 releasesAt 的 entry 改為 available。 */
  async settleHold(payeeId: string, now: Date = new Date()): Promise<number> {
    const entries = await this.store.listLedgerByPayee(payeeId);
    let released = 0;
    for (const e of entries) {
      if (e.status !== 'held') continue;
      if (e.releasesAt.getTime() > now.getTime()) continue;
      await this.store.updateLedgerStatus(e.id, 'available');
      released++;
    }
    return released;
  }

  /** 給 dashboard：payee 累計（held / available / total）。 */
  async getPayeeBalance(
    payeeId: string,
  ): Promise<{ heldMinor: number; availableMinor: number; totalMinor: number }> {
    const entries = await this.store.listLedgerByPayee(payeeId);
    let heldMinor = 0;
    let availableMinor = 0;
    for (const e of entries) {
      if (e.status === 'held') heldMinor += e.amountMinor;
      else if (e.status === 'available') availableMinor += e.amountMinor;
    }
    return { heldMinor, availableMinor, totalMinor: heldMinor + availableMinor };
  }

  /** 月結報表：列出某月 available 金額 + 對應 entry。 */
  async generateMonthlyPayout(
    tenantId: string,
    payeeId: string,
    payeeRole: PayeeRole,
    year: number,
    month: number,
  ): Promise<MonthlyPayoutSummary> {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const entries = await this.store.listLedgerByPayee(payeeId);
    const matched = entries.filter((e) => {
      if (e.status !== 'available') return false;
      const d = e.releasesAt;
      return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month;
    });
    return {
      tenantId,
      payeeId,
      payeeRole,
      month: monthKey,
      amountMinor: matched.reduce((s, e) => s + e.amountMinor, 0),
      entryIds: matched.map((e) => e.id),
    };
  }

  /** 取得 policy（先找 course 專屬，回退到 tenant 預設）。 */
  private async resolvePolicy(tenantId: string, courseId: string): Promise<CommissionPolicy> {
    const policy = await this.store.findPolicy(tenantId, courseId);
    if (!policy) throw new Error(`找不到 commission policy（tenant=${tenantId}, course=${courseId}）`);
    const total =
      policy.platformRate + policy.instructorRate + policy.affiliateL1Rate + policy.affiliateL2Rate;
    if (total > 1.0001) throw new Error(`分潤總和超過 100%：${total}`);
    return policy;
  }
}
