import { randomUUID } from 'node:crypto';

import type {
  IssueAllowanceHook,
  ProgressHydrator,
  RefundEligibility,
  RefundPolicy,
  RefundReason,
  RefundRequest,
  RefundStore,
} from './types.js';

export interface CheckEligibilityInput {
  tenantId: string;
  courseId: string;
  orderId: string;
  /** 訂單金額。 */
  amountMinor: number;
  /** 訂單付款時間。 */
  paidAt: Date;
  /** 目前學員已觀看比例（0~1）。 */
  watchedRatio: number;
  /** 已完成的單元數 / 課程總單元數。 */
  completedLessons?: number;
  totalLessons?: number;
  now?: Date;
}

export interface CreateRequestInput {
  tenantId: string;
  orderId: string;
  enrollmentId: string;
  userId: string;
  courseId: string;
  amountMinor: number;
  paidAt: Date;
  watchedRatio: number;
  completedLessons?: number;
  totalLessons?: number;
  reason: RefundReason;
  reasonText?: string;
  now?: Date;
}

/**
 * 課程退費 service：7 天鑑賞期（觀看 < 30% 全退）+ 按比例 + 自動連動發票折讓。
 */
export class RefundService {
  constructor(
    private readonly store: RefundStore,
    /** 由 invoice 模組注入：核准時呼叫 invoice.issueAllowance(). */
    private readonly issueAllowance: IssueAllowanceHook,
    /**
     * 由 progress 模組注入（選填，但生產環境必填）：
     * `createRequest` 會用此 hook 拉伺服端權威進度覆蓋 client 傳值，
     * 防止學員偽造 `watchedRatio` 騙全額退費。
     */
    private readonly hydrateProgress?: ProgressHydrator,
  ) {}

  upsertPolicy(p: RefundPolicy): Promise<void> {
    return this.store.upsertPolicy(p);
  }

  /** 試算退費資格（不寫入資料庫，用於前台顯示「目前可退多少」）。 */
  async checkEligibility(input: CheckEligibilityInput): Promise<RefundEligibility> {
    const policy = await this.resolvePolicy(input.tenantId, input.courseId);
    const now = input.now ?? new Date();
    const daysSincePaid = (now.getTime() - input.paidAt.getTime()) / 86_400_000;
    const inCoolingOff = daysSincePaid <= policy.coolingOffDays;
    if (inCoolingOff) {
      if (input.watchedRatio < policy.maxWatchedRatioForFullRefund) {
        return { eligible: true, mode: 'full', refundableMinor: input.amountMinor };
      }
      return {
        eligible: false,
        mode: 'none',
        refundableMinor: 0,
        reason: `觀看已超過 ${Math.round(policy.maxWatchedRatioForFullRefund * 100)}%（鑑賞期內限制）`,
      };
    }
    if (!policy.allowProRataAfterCoolingOff) {
      return { eligible: false, mode: 'none', refundableMinor: 0, reason: '已超過鑑賞期' };
    }
    const remainingRatio = computeRemainingRatio(policy, input, daysSincePaid);
    const refundableMinor = Math.max(0, Math.floor(input.amountMinor * remainingRatio));
    if (refundableMinor <= 0) {
      return { eligible: false, mode: 'none', refundableMinor: 0, reason: '剩餘比例為 0' };
    }
    return { eligible: true, mode: 'pro-rata', refundableMinor };
  }

  /**
   * 學員提出退費申請。
   *
   * 注意：若 ctor 有注入 `hydrateProgress`，會以伺服端權威進度覆蓋
   * client 傳入的 `watchedRatio` / `completedLessons` / `totalLessons`，
   * 並用覆蓋後的值重新跑 `checkEligibility`。
   */
  async createRequest(input: CreateRequestInput): Promise<RefundRequest> {
    let authoritative = input;
    if (this.hydrateProgress) {
      const fresh = await this.hydrateProgress({
        tenantId: input.tenantId,
        userId: input.userId,
        courseId: input.courseId,
        enrollmentId: input.enrollmentId,
      });
      authoritative = {
        ...input,
        watchedRatio: fresh.watchedRatio,
        completedLessons: fresh.completedLessons ?? input.completedLessons,
        totalLessons: fresh.totalLessons ?? input.totalLessons,
      };
    }
    const eligibility = await this.checkEligibility(authoritative);
    if (!eligibility.eligible) {
      throw new Error(`不符合退費條件：${eligibility.reason ?? '未知'}`);
    }
    const req: RefundRequest = {
      id: randomUUID(),
      tenantId: input.tenantId,
      orderId: input.orderId,
      enrollmentId: input.enrollmentId,
      userId: input.userId,
      courseId: input.courseId,
      originalAmountMinor: input.amountMinor,
      refundableMinor: eligibility.refundableMinor,
      reason: input.reason,
      reasonText: input.reasonText,
      status: 'pending',
      requestedAt: input.now ?? new Date(),
    };
    await this.store.upsertRequest(req);
    return req;
  }

  /** 核准退費 → 呼叫 invoice.issueAllowance → 標 refunded。 */
  async approve(id: string, now: Date = new Date()): Promise<RefundRequest> {
    const r = await this.store.getRequest(id);
    if (!r) throw new Error('找不到退費申請');
    if (r.status !== 'pending') throw new Error('只有 pending 可核准');
    const { allowanceId } = await this.issueAllowance({
      orderId: r.orderId,
      refundAmountMinor: r.refundableMinor,
      reason: r.reason,
    });
    r.status = 'approved';
    r.invoiceAllowanceId = allowanceId;
    r.processedAt = now;
    await this.store.upsertRequest(r);
    return r;
  }

  /** 標記為已完成退款（金流退款成功 callback 後呼叫）。 */
  async markRefunded(id: string, now: Date = new Date()): Promise<RefundRequest> {
    const r = await this.store.getRequest(id);
    if (!r) throw new Error('找不到退費申請');
    if (r.status !== 'approved') throw new Error('只有 approved 可標記為已退款');
    r.status = 'refunded';
    r.processedAt = now;
    await this.store.upsertRequest(r);
    return r;
  }

  /** 駁回退費。 */
  async reject(id: string, rejectionReason: string, now: Date = new Date()): Promise<RefundRequest> {
    const r = await this.store.getRequest(id);
    if (!r) throw new Error('找不到退費申請');
    if (r.status !== 'pending') throw new Error('只有 pending 可駁回');
    r.status = 'rejected';
    r.rejectionReason = rejectionReason;
    r.processedAt = now;
    await this.store.upsertRequest(r);
    return r;
  }

  private async resolvePolicy(tenantId: string, courseId: string): Promise<RefundPolicy> {
    const p = await this.store.findPolicy(tenantId, courseId);
    if (!p) throw new Error(`找不到 refund policy（tenant=${tenantId}, course=${courseId}）`);
    return p;
  }
}

function computeRemainingRatio(
  policy: RefundPolicy,
  input: CheckEligibilityInput,
  daysSincePaid: number,
): number {
  if (policy.proRataBasis === 'remaining-lessons') {
    const total = input.totalLessons ?? 0;
    const completed = input.completedLessons ?? 0;
    if (total === 0) return 0;
    return Math.max(0, 1 - completed / total);
  }
  const total = policy.courseDurationDays ?? 0;
  if (total === 0) return 0;
  return Math.max(0, 1 - daysSincePaid / total);
}
