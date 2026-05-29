import type { CustomerSegment, LifecycleStage } from './types.js';

/**
 * 客戶屬性 snapshot：判斷是否屬於某 segment 用。
 */
export interface CustomerProfile {
  customerId: string;
  tenantId?: string;
  tags: string[];
  lifecycleStage: LifecycleStage;
}

/**
 * 判斷客戶是否符合 segment 條件。
 *
 * 規則：
 *   1. tenantId 必須一致（若 segment 有指定）
 *   2. requiredTags 全部命中
 *   3. anyTags 至少命中一個（若有指定）
 *   4. excludedTags 不能命中任何
 *   5. lifecycleStages 命中（若有指定）
 */
export function matchSegment(
  customer: CustomerProfile,
  segment: CustomerSegment,
): boolean {
  if (
    segment.tenantId !== undefined &&
    customer.tenantId !== undefined &&
    segment.tenantId !== customer.tenantId
  ) {
    return false;
  }
  const tagSet = new Set(customer.tags);
  if (segment.requiredTags && !segment.requiredTags.every((t) => tagSet.has(t))) {
    return false;
  }
  if (
    segment.anyTags &&
    segment.anyTags.length > 0 &&
    !segment.anyTags.some((t) => tagSet.has(t))
  ) {
    return false;
  }
  if (segment.excludedTags && segment.excludedTags.some((t) => tagSet.has(t))) {
    return false;
  }
  if (
    segment.lifecycleStages &&
    segment.lifecycleStages.length > 0 &&
    !segment.lifecycleStages.includes(customer.lifecycleStage)
  ) {
    return false;
  }
  return true;
}
