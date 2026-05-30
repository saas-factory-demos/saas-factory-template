/**
 * 折扣引擎協調器（goal 03 §5）。
 */

import { evaluateConditions } from './conditions.js';
import { applyRule } from './rules.js';

import type { DiscountRule, DiscountContext, DiscountResult } from './types.js';

/**
 * 折扣引擎，負責過濾啟用規則、檢查條件、依優先序套用、處理 stackable 邏輯。
 */
export class DiscountEngine {
  /**
   * 套用一組規則到 context，回傳實際生效的折扣結果列表。
   *
   * 規則處理邏輯：
   * 1. 過濾 active 且在有效期內的規則。
   * 2. 過濾使用次數未超限的規則。
   * 3. 過濾條件全部通過的規則。
   * 4. 依 priority 由大到小排序。
   * 5. 將規則分為 stackable 與 non-stackable 兩組。
   * 6. non-stackable 內僅保留結果金額最大的一筆。
   * 7. stackable 全部保留，與 non-stackable 最佳者一起回傳。
   */
  apply(rules: DiscountRule[], context: DiscountContext): DiscountResult[] {
    const now = (context.now ?? new Date()).getTime();
    const eligible = rules.filter((r) => {
      if (!r.active) return false;
      if (r.startsAt && new Date(r.startsAt).getTime() > now) return false;
      if (r.endsAt && new Date(r.endsAt).getTime() < now) return false;
      if (r.maxUses != null && r.usedCount >= r.maxUses) return false;
      if (r.maxUsesPerUser != null) {
        const used = context.customerUsageCounts?.[r.id] ?? 0;
        if (used >= r.maxUsesPerUser) return false;
      }
      return evaluateConditions(r.conditions, context);
    });

    const sorted = [...eligible].sort((a, b) => b.priority - a.priority);

    const results: DiscountResult[] = [];
    let bestNonStackable: { result: DiscountResult; score: number } | null = null;

    for (const rule of sorted) {
      const result = applyRule(rule, context);
      if (!result) continue;
      if (rule.stackable) {
        results.push(result);
      } else {
        const score = result.amount + (result.shippingDiscount ?? 0);
        if (!bestNonStackable || score > bestNonStackable.score) {
          bestNonStackable = { result, score };
        }
      }
    }

    if (bestNonStackable) results.push(bestNonStackable.result);
    return results;
  }
}
