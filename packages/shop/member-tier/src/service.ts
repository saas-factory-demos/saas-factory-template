/**
 * 會員等級服務。
 */

import type {
  MemberTier,
  MemberTierStatus,
  MemberTierStore,
  TierConditionType,
  TierEvaluationContext,
  TierEvaluationResult,
} from './types.js';
import type { DomainEvent } from '@saas-factory/events';


export interface MemberTierServiceConfig {
  emit?: (event: DomainEvent) => void;
  /** 年度檢核間隔（天）。 */
  reviewIntervalDays?: number;
  now?: () => Date;
}

/**
 * 會員等級服務：升降級評估 + 年度檢核 + 事件 emit。
 */
export class MemberTierService {
  constructor(
    private readonly store: MemberTierStore,
    private readonly config: MemberTierServiceConfig = {},
  ) {}

  /**
   * 依 context 評估使用者應屬等級，更新 status 並 emit 事件。
   *
   * 若評估結果與現狀相同則不寫入。
   */
  async evaluate(context: TierEvaluationContext): Promise<TierEvaluationResult> {
    const tiers = await this.store.listTiers(context.tenantId);
    const status = await this.store.getStatus(context.userId, context.tenantId);

    const eligible = tiers
      .filter((t) => t.active && this.matchesConditions(t.conditions, context))
      .sort((a, b) => b.rank - a.rank);

    const targetTier = eligible[0] ?? null;
    const previousTierId = status?.tierId ?? null;

    if (targetTier?.id === previousTierId) {
      return { resolvedTierId: previousTierId, changed: false, reason: 'unchanged' };
    }

    const reason = this.resolveReason(tiers, previousTierId, targetTier?.id ?? null);
    const at = (this.config.now?.() ?? new Date()).toISOString();
    const nextReviewAt = this.computeNextReview(at);

    const newStatus: MemberTierStatus = {
      userId: context.userId,
      tenantId: context.tenantId,
      tierId: targetTier?.id ?? null,
      enteredAt: at,
      nextReviewAt,
      totalSpend: context.totalSpend,
      orderCount: context.orderCount,
    };
    await this.store.saveStatus(newStatus);

    if (targetTier && targetTier.notifyOnChange) {
      this.config.emit?.({
        type: 'member.tier-changed',
        payload: {
          userId: context.userId,
          tenantId: context.tenantId,
          fromTier: previousTierId,
          toTier: targetTier.id,
          reason,
        },
      });
    }

    return { resolvedTierId: targetTier?.id ?? null, changed: true, reason };
  }

  /**
   * 取得使用者目前等級設定（給折扣 / 點數 / 免運使用）。
   */
  async getCurrentTier(userId: string, tenantId: string): Promise<MemberTier | null> {
    const status = await this.store.getStatus(userId, tenantId);
    if (!status?.tierId) return null;
    const tiers = await this.store.listTiers(tenantId);
    return tiers.find((t) => t.id === status.tierId) ?? null;
  }

  private matchesConditions(
    conditions: TierConditionType[],
    context: TierEvaluationContext,
  ): boolean {
    return conditions.every((c) => {
      switch (c.type) {
        case 'total_spend':
          return context.totalSpend >= c.amount;
        case 'order_count':
          return context.orderCount >= c.count;
        case 'custom': {
          const value = context.customValues?.[c.key];
          return value === c.value;
        }
      }
    });
  }

  private resolveReason(
    tiers: MemberTier[],
    fromId: string | null,
    toId: string | null,
  ): 'upgrade' | 'downgrade' | 'manual' {
    if (!fromId) return 'upgrade';
    if (!toId) return 'downgrade';
    const fromRank = tiers.find((t) => t.id === fromId)?.rank ?? 0;
    const toRank = tiers.find((t) => t.id === toId)?.rank ?? 0;
    return toRank > fromRank ? 'upgrade' : 'downgrade';
  }

  private computeNextReview(fromIso: string): string {
    const days = this.config.reviewIntervalDays ?? 365;
    const ms = days * 24 * 60 * 60 * 1000;
    return new Date(new Date(fromIso).getTime() + ms).toISOString();
  }
}
