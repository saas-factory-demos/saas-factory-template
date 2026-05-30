import type {
  LoyaltyProgramConfig,
  LoyaltyTier,
  PointEntry,
} from './types.js';

/** 依設定計算單筆訂單應得點數。 */
export function computeEarnPoints(
  orderTotalMinor: number,
  tier: LoyaltyTier,
  base: LoyaltyProgramConfig,
): number {
  const minorPerPoint = tier.earnRateOverride?.minorPerPoint ?? base.minorPerPoint;
  if (minorPerPoint <= 0) return 0;
  const raw = Math.floor(orderTotalMinor / minorPerPoint);
  return Math.floor(raw * tier.earnMultiplier);
}

/** 依 rolling12m 消費找對應 tier。 */
export function resolveTier(spend: number, tiers: LoyaltyTier[]): LoyaltyTier {
  if (tiers.length === 0) throw new Error('tiers 不可為空');
  const sorted = [...tiers].sort((a, b) => a.thresholdMinor - b.thresholdMinor);
  let cur = sorted[0]!;
  for (const t of sorted) {
    if (spend >= t.thresholdMinor) cur = t;
  }
  return cur;
}

/** 加減月份（保守實作，跨月以末日對齊）。 */
export function addMonths(d: Date, months: number): Date {
  const date = new Date(d);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, lastDay));
  return date;
}

/** 依 earn-order / refund-clawback 條目反算過去 12 個月消費。 */
export function computeRolling12mSpendMinor(
  entries: PointEntry[],
  cfg: LoyaltyProgramConfig,
  cutoff: Date,
): number {
  const refTier = cfg.tiers.find((t) => t.earnMultiplier !== 0) ?? cfg.tiers[0]!;
  const minorPerPoint = refTier.earnRateOverride?.minorPerPoint ?? cfg.minorPerPoint;
  let spendMinor = 0;
  for (const e of entries) {
    if (e.createdAt < cutoff) continue;
    if (e.kind === 'earn-order') {
      spendMinor += Math.round((e.points / refTier.earnMultiplier) * minorPerPoint);
    } else if (e.kind === 'refund-clawback') {
      spendMinor -= Math.round((-e.points / refTier.earnMultiplier) * minorPerPoint);
    }
  }
  return Math.max(0, spendMinor);
}
