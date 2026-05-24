import type { CustomerActivity, LifecycleStage } from './types.js';

const DAY = 24 * 60 * 60 * 1000;

/** 純函式：依活動快照與當下時間判定 lifecycle 階段。 */
export function classifyLifecycle(activity: CustomerActivity, now: Date): LifecycleStage {
  if (!activity.lastPurchaseAt || activity.totalOrders === 0) return 'never-purchased';
  const daysSinceLast = (now.getTime() - activity.lastPurchaseAt.getTime()) / DAY;

  if (activity.totalOrders === 1 && activity.firstPurchaseAt) {
    const daysSinceFirst = (now.getTime() - activity.firstPurchaseAt.getTime()) / DAY;
    if (daysSinceFirst <= 30) return 'new';
  }
  if (daysSinceLast <= 90) return 'active';
  if (daysSinceLast <= 180) return 'at-risk';
  if (daysSinceLast <= 365) return 'dormant';
  return 'lost';
}
