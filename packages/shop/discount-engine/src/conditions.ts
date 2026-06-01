/**
 * 條件評估器（goal 03 §5）。
 */

import type { DiscountCondition, DiscountContext } from './types.js';

/**
 * 取得目前評估時間，預設為 now，可由 context.now 注入測試。
 */
function getNow(context: DiscountContext): Date {
  return context.now ?? new Date();
}

/**
 * 評估單一條件是否符合 context。
 */
export function evaluateCondition(
  condition: DiscountCondition,
  context: DiscountContext,
): boolean {
  switch (condition.type) {
    case 'min_amount':
      return context.subtotal >= condition.amount;
    case 'min_quantity': {
      const total = context.items.reduce((sum, i) => sum + i.quantity, 0);
      return total >= condition.quantity;
    }
    case 'member_tier':
      return context.memberTier != null && condition.tiers.includes(context.memberTier);
    case 'first_purchase':
      return context.isFirstPurchase === true;
    case 'birthday_month':
      return context.birthdayMonth != null && context.birthdayMonth === getNow(context).getMonth() + 1;
    case 'specific_items':
      return context.items.some((i) => condition.variantIds.includes(i.variantId));
    case 'specific_categories':
      return context.items.some((i) =>
        i.categoryIds?.some((c) => condition.categoryIds.includes(c)),
      );
    case 'date_range': {
      const now = getNow(context).getTime();
      return now >= new Date(condition.from).getTime() && now <= new Date(condition.to).getTime();
    }
    case 'day_of_week':
      return condition.days.includes(getNow(context).getDay());
    case 'time_of_day': {
      const d = getNow(context);
      const minutes = d.getHours() * 60 + d.getMinutes();
      const [fh, fm] = condition.from.split(':').map(Number);
      const [th, tm] = condition.to.split(':').map(Number);
      const from = (fh ?? 0) * 60 + (fm ?? 0);
      const to = (th ?? 0) * 60 + (tm ?? 0);
      return minutes >= from && minutes <= to;
    }
    case 'customer_tag':
      return context.customerTags?.some((t) => condition.tags.includes(t)) ?? false;
    case 'site_type':
      return context.siteType != null && condition.siteTypes.includes(context.siteType);
    case 'custom':
      // 自訂條件預設不通過，需外部 plugin 擴充。
      return false;
  }
}

/**
 * 評估全部條件，AND 邏輯。
 */
export function evaluateConditions(
  conditions: DiscountCondition[],
  context: DiscountContext,
): boolean {
  return conditions.every((c) => evaluateCondition(c, context));
}
