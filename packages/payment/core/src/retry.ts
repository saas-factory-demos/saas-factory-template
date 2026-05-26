/**
 * 訂閱失敗重試策略（02-08 lock：3 次 D+1 / D+3 / D+7，第 3 次失敗 → cancel + email）。
 */

export interface SubscriptionRetryPlan {
  /** 第幾次重試（從 0 起算，0 = 首次失敗後的第一次重試） */
  attempt: number;
  /** 距離首次失敗的天數 */
  delayDays: number;
  /** 若本次仍失敗，是否在此次後取消訂閱 */
  cancelAfter: boolean;
}

export const DEFAULT_SUBSCRIPTION_RETRY: readonly SubscriptionRetryPlan[] = [
  { attempt: 0, delayDays: 1, cancelAfter: false },
  { attempt: 1, delayDays: 3, cancelAfter: false },
  { attempt: 2, delayDays: 7, cancelAfter: true },
];

/**
 * 給定首次失敗時間 + 第幾次重試，回傳下次嘗試時間。
 * 若本次重試已是最後一次，回傳 null。
 */
export function nextRetryAt(
  firstFailedAt: Date,
  currentAttempt: number,
  plan: readonly SubscriptionRetryPlan[] = DEFAULT_SUBSCRIPTION_RETRY,
): Date | null {
  const next = plan[currentAttempt];
  if (!next) return null;
  const t = new Date(firstFailedAt);
  t.setUTCDate(t.getUTCDate() + next.delayDays);
  return t;
}

export function shouldCancelSubscription(
  attempt: number,
  plan: readonly SubscriptionRetryPlan[] = DEFAULT_SUBSCRIPTION_RETRY,
): boolean {
  return plan[attempt]?.cancelAfter ?? true;
}
