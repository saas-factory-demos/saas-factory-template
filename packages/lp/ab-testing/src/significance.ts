import type { SignificanceResult, VariantStats } from './types.js';

/** 標準常態分佈 CDF（Abramowitz & Stegun 近似）。 */
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-(z * z) / 2);
  const p =
    d *
    t *
    (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
}

/**
 * 雙樣本 Z-test 比例檢定。
 * H0: baseline conversion rate === challenger conversion rate
 * H1: rates differ (two-tailed)
 */
export function zTestProportions(
  baseline: VariantStats,
  challenger: VariantStats,
  alpha = 0.05,
): SignificanceResult {
  const n1 = baseline.visitors;
  const n2 = challenger.visitors;
  if (n1 === 0 || n2 === 0) {
    return {
      baselineId: baseline.variantId,
      challengerId: challenger.variantId,
      uplift: 0,
      zScore: 0,
      pValue: 1,
      significant: false,
    };
  }
  const p1 = baseline.conversions / n1;
  const p2 = challenger.conversions / n2;
  const pPool = (baseline.conversions + challenger.conversions) / (n1 + n2);
  const variance = pPool * (1 - pPool) * (1 / n1 + 1 / n2);
  const se = Math.sqrt(variance);
  const z = se === 0 ? 0 : (p2 - p1) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));
  const uplift = p1 === 0 ? 0 : p2 / p1 - 1;
  return {
    baselineId: baseline.variantId,
    challengerId: challenger.variantId,
    uplift,
    zScore: z,
    pValue,
    significant: pValue < alpha,
  };
}
