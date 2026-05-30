import type { Course, CoursePricing } from './types.js';

/** 計算課程當前售價：考慮募資、預售、早鳥、原價優先順序。 */
export function resolveEffectivePrice(course: Course, now: Date = new Date()): number {
  const p = course.pricing;
  if (course.status === 'crowdfunding' || course.status === 'presale') {
    if (p.earlyBirdPrice !== undefined && isEarlyBirdActive(p, now)) {
      return p.earlyBirdPrice;
    }
    return p.price;
  }
  if (p.earlyBirdPrice !== undefined && isEarlyBirdActive(p, now)) {
    return p.earlyBirdPrice;
  }
  return p.price;
}

/** 早鳥是否生效。 */
export function isEarlyBirdActive(p: CoursePricing, now: Date = new Date()): boolean {
  if (p.earlyBirdPrice === undefined) return false;
  if (!p.earlyBirdEndsAt) return true;
  return now.getTime() < p.earlyBirdEndsAt.getTime();
}

/** 募資是否達標。 */
export function isCrowdfundingFunded(course: Course): boolean {
  const p = course.pricing;
  if (p.crowdfundingGoal === undefined) return false;
  return (p.crowdfundingCurrent ?? 0) >= p.crowdfundingGoal;
}

/** 募資是否截止（過時間或達標皆視為截止）。 */
export function isCrowdfundingClosed(course: Course, now: Date = new Date()): boolean {
  const p = course.pricing;
  if (p.crowdfundingDeadline && now.getTime() >= p.crowdfundingDeadline.getTime()) {
    return true;
  }
  return isCrowdfundingFunded(course);
}
