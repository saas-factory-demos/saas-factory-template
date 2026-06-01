/**
 * 折扣規則套用器（goal 03 §5）。
 */

import type { DiscountRule, DiscountContext, DiscountResult } from './types.js';

/**
 * 百分比折扣。params: { percentage: 0-100, maxAmount? }
 */
function applyPercentageOff(rule: DiscountRule, ctx: DiscountContext): DiscountResult | null {
  const percentage = Number(rule.params.percentage ?? 0);
  const maxAmount = rule.params.maxAmount as number | undefined;
  if (percentage <= 0) return null;
  let amount = Math.floor((ctx.subtotal * percentage) / 100);
  if (maxAmount != null) amount = Math.min(amount, maxAmount);
  return { ruleId: rule.id, ruleName: rule.name, amount };
}

/**
 * 固定金額折扣。params: { amount }
 */
function applyFixedOff(rule: DiscountRule, ctx: DiscountContext): DiscountResult | null {
  const amount = Number(rule.params.amount ?? 0);
  if (amount <= 0) return null;
  return { ruleId: rule.id, ruleName: rule.name, amount: Math.min(amount, ctx.subtotal) };
}

/**
 * 免運。params: { shippingFee }
 */
function applyFreeShipping(rule: DiscountRule, _ctx: DiscountContext): DiscountResult | null {
  const shippingFee = Number(rule.params.shippingFee ?? 0);
  return {
    ruleId: rule.id,
    ruleName: rule.name,
    amount: 0,
    shippingDiscount: shippingFee,
  };
}

/**
 * 買 X 送 Y。params: { buyQuantity, getQuantity, targetVariantId, unitPrice }
 * 送的品項享 100% off。
 */
function applyBuyXGetY(rule: DiscountRule, ctx: DiscountContext): DiscountResult | null {
  const buyQty = Number(rule.params.buyQuantity ?? 0);
  const getQty = Number(rule.params.getQuantity ?? 0);
  const targetVariantId = rule.params.targetVariantId as string | undefined;
  if (buyQty <= 0 || getQty <= 0 || !targetVariantId) return null;
  const idx = ctx.items.findIndex((i) => i.variantId === targetVariantId);
  if (idx < 0) return null;
  const item = ctx.items[idx]!;
  const groups = Math.floor(item.quantity / (buyQty + getQty));
  if (groups <= 0) return null;
  const freeQty = groups * getQty;
  return {
    ruleId: rule.id,
    ruleName: rule.name,
    amount: freeQty * item.unitPrice,
    allocatedItemIndexes: [idx],
  };
}

/**
 * 階梯折扣。params: { tiers: [{ threshold, discount }] }
 */
function applyTiered(rule: DiscountRule, ctx: DiscountContext): DiscountResult | null {
  const tiers = rule.params.tiers as Array<{ threshold: number; discount: number }> | undefined;
  if (!tiers || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => b.threshold - a.threshold);
  const hit = sorted.find((t) => ctx.subtotal >= t.threshold);
  if (!hit) return null;
  return { ruleId: rule.id, ruleName: rule.name, amount: hit.discount };
}

/**
 * 組合包折扣。params: { variantIds: string[], discount }
 * 所有指定 variant 都在購物車才生效。
 */
function applyBundle(rule: DiscountRule, ctx: DiscountContext): DiscountResult | null {
  const variantIds = rule.params.variantIds as string[] | undefined;
  const discount = Number(rule.params.discount ?? 0);
  if (!variantIds || variantIds.length === 0 || discount <= 0) return null;
  const allPresent = variantIds.every((vid) => ctx.items.some((i) => i.variantId === vid));
  if (!allPresent) return null;
  const indexes = ctx.items
    .map((i, idx) => (variantIds.includes(i.variantId) ? idx : -1))
    .filter((idx) => idx >= 0);
  return {
    ruleId: rule.id,
    ruleName: rule.name,
    amount: discount,
    allocatedItemIndexes: indexes,
  };
}

/**
 * 第 N 件折扣。params: { n, discount, targetVariantId? }
 */
function applyNthItemOff(rule: DiscountRule, ctx: DiscountContext): DiscountResult | null {
  const n = Number(rule.params.n ?? 0);
  const discount = Number(rule.params.discount ?? 0);
  const targetVariantId = rule.params.targetVariantId as string | undefined;
  if (n <= 0 || discount <= 0) return null;
  const candidates = targetVariantId
    ? ctx.items.filter((i) => i.variantId === targetVariantId)
    : ctx.items;
  const totalQty = candidates.reduce((sum, i) => sum + i.quantity, 0);
  if (totalQty < n) return null;
  const hitCount = Math.floor(totalQty / n);
  return { ruleId: rule.id, ruleName: rule.name, amount: hitCount * discount };
}

/**
 * 滿額贈品。params: { giftVariantId, minAmount? }
 */
function applyGift(rule: DiscountRule, ctx: DiscountContext): DiscountResult | null {
  const giftVariantId = rule.params.giftVariantId as string | undefined;
  const minAmount = Number(rule.params.minAmount ?? 0);
  if (!giftVariantId) return null;
  if (minAmount > 0 && ctx.subtotal < minAmount) return null;
  return { ruleId: rule.id, ruleName: rule.name, amount: 0, giftVariantId };
}

/**
 * 首購折扣。params: { discount } 由 first_purchase 條件控制是否生效。
 */
function applyFirstPurchase(rule: DiscountRule, ctx: DiscountContext): DiscountResult | null {
  const discount = Number(rule.params.discount ?? 0);
  if (discount <= 0) return null;
  return { ruleId: rule.id, ruleName: rule.name, amount: Math.min(discount, ctx.subtotal) };
}

/**
 * 訂閱忠誠折扣。params: { discount, percentage? }
 */
function applySubscriptionLoyalty(rule: DiscountRule, ctx: DiscountContext): DiscountResult | null {
  const percentage = Number(rule.params.percentage ?? 0);
  const fixed = Number(rule.params.discount ?? 0);
  let amount = 0;
  if (percentage > 0) amount = Math.floor((ctx.subtotal * percentage) / 100);
  else if (fixed > 0) amount = Math.min(fixed, ctx.subtotal);
  if (amount <= 0) return null;
  return { ruleId: rule.id, ruleName: rule.name, amount };
}

/**
 * 套用單一規則到 context，回傳結果或 null。
 */
export function applyRule(rule: DiscountRule, ctx: DiscountContext): DiscountResult | null {
  switch (rule.type) {
    case 'percentage_off':
      return applyPercentageOff(rule, ctx);
    case 'fixed_off':
      return applyFixedOff(rule, ctx);
    case 'free_shipping':
      return applyFreeShipping(rule, ctx);
    case 'buy_x_get_y':
      return applyBuyXGetY(rule, ctx);
    case 'tiered':
      return applyTiered(rule, ctx);
    case 'bundle':
      return applyBundle(rule, ctx);
    case 'nth_item_off':
      return applyNthItemOff(rule, ctx);
    case 'gift':
      return applyGift(rule, ctx);
    case 'first_purchase':
      return applyFirstPurchase(rule, ctx);
    case 'subscription_loyalty':
      return applySubscriptionLoyalty(rule, ctx);
    case 'custom':
      // 自訂規則需外部 plugin 擴充。
      return null;
  }
}
