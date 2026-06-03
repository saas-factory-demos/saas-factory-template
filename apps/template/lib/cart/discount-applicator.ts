/**
 * Discount Applicator（Phase 6 多商品擴充 — Q3=C 同類擇優 + mutex tags）。
 *
 * 把 discount-rules collection 撈出的 rules 餵給 @saas-factory/shop-discount-engine
 * 計算 raw results，再用 Phase 6 規則篩：
 *
 *   1. 按 category 分組
 *   2. 同 category 取 amount 最大那條（擇優）
 *   3. mutexTags 排除（重複 tag 只留 priority 最高）
 *   4. 整批跨類最多取 N=3（CART_LEVEL_MAX_DISCOUNTS）
 *
 * 套到 cart：把 appliedDiscounts snapshot 寫進 cart，下次 load 直接顯示。
 */
import { DiscountEngine } from '@saas-factory/shop-discount-engine';

import type {
  DiscountContext,
  DiscountResult,
  DiscountRule,
} from '@saas-factory/shop-discount-engine';

/** Phase 6 規則：跨類最多 3 個生效。 */
export const CART_LEVEL_MAX_DISCOUNTS = 3;

/** 套用後的 result 多帶 category（DB collection 欄位）給前端分組顯示。 */
export interface AppliedDiscountWithCategory extends DiscountResult {
  category: 'auto-percentage' | 'auto-amount' | 'coupon' | 'shipping' | 'bundle';
  mutexTags?: string[];
  priority: number;
}

/**
 * 從 Payload discount-rules collection doc 轉成 engine 需要的 DiscountRule。
 *
 * 為何要轉換：Payload JSON field 存 conditions / params 是 unknown，engine
 * 需要 typed input。轉換層做 light validation（缺欄位就跳過）。
 */
function payloadToEngineRule(doc: Record<string, unknown>): DiscountRule | null {
  if (!doc.active) return null;
  const id = String(doc.id);
  const tenantId = String(doc.tenantId ?? 'default');
  const name = String(doc.name ?? 'unnamed');
  const type = doc.type as DiscountRule['type'];
  if (!type) return null;
  const params = (doc.params as Record<string, unknown>) ?? {};
  const conditions = (doc.conditions as DiscountRule['conditions']) ?? [];
  return {
    id,
    tenantId,
    name,
    type,
    params,
    conditions,
    stackable: doc.stackable !== false,
    priority: (doc.priority as number) ?? 50,
    maxUses: doc.maxUses as number | undefined,
    usedCount: (doc.usedCount as number) ?? 0,
    maxUsesPerUser: doc.maxUsesPerUser as number | undefined,
    active: true,
    startsAt: doc.startsAt as string | undefined,
    endsAt: doc.endsAt as string | undefined,
  };
}

/**
 * Q3=C 主邏輯：跑 engine → 同類擇優 → mutex 排除 → 跨類取最多 3 個。
 *
 * 回傳套用後的折扣 + 各 line item 分攤金額。
 */
export function applyCartDiscountsQ3C(input: {
  rules: Array<Record<string, unknown>>;
  context: DiscountContext;
  /** 客戶輸入的 coupon code（過濾僅匹配的 category=coupon rules）。 */
  couponCode?: string;
}): {
  applied: AppliedDiscountWithCategory[];
  totalDiscount: number;
} {
  // 1. 轉成 engine 需要的格式 + coupon code 過濾
  const allRules: Array<{ rule: DiscountRule; category: string; mutexTags?: string[] }> = [];
  for (const raw of input.rules) {
    const rule = payloadToEngineRule(raw);
    if (!rule) continue;
    const category = String(raw.category ?? 'auto-amount');
    const couponCode = raw.couponCode as string | undefined;
    // coupon 規則只在 user 輸入碼匹配時放進候選
    if (category === 'coupon' && couponCode && couponCode !== input.couponCode) continue;
    const mutexTagsRaw = raw.mutexTags as Array<{ tag: string }> | undefined;
    const mutexTags = mutexTagsRaw?.map((m) => m.tag);
    allRules.push({ rule, category, mutexTags });
  }

  // 2. engine 計算 raw results
  const engine = new DiscountEngine();
  const rawResults = engine.apply(
    allRules.map((r) => r.rule),
    input.context,
  );

  // 3. 把 result 配對 category + mutexTags（rawResults[].ruleId 對回 allRules）
  const enriched: AppliedDiscountWithCategory[] = [];
  for (const r of rawResults) {
    const meta = allRules.find((a) => a.rule.id === r.ruleId);
    if (!meta) continue;
    enriched.push({
      ...r,
      category: meta.category as AppliedDiscountWithCategory['category'],
      mutexTags: meta.mutexTags,
      priority: meta.rule.priority,
    });
  }

  // 4. 同類擇優：按 category 分組，取 amount 最大那條
  const byCategory = new Map<string, AppliedDiscountWithCategory>();
  for (const r of enriched) {
    const existing = byCategory.get(r.category);
    if (!existing || r.amount > existing.amount) {
      byCategory.set(r.category, r);
    }
  }

  // 5. mutex 排除：相同 tag 只留 priority 最高
  const afterMutex: AppliedDiscountWithCategory[] = [];
  const usedTags = new Set<string>();
  const sorted = Array.from(byCategory.values()).sort((a, b) => b.priority - a.priority);
  for (const r of sorted) {
    if (r.mutexTags && r.mutexTags.some((t) => usedTags.has(t))) continue;
    afterMutex.push(r);
    r.mutexTags?.forEach((t) => usedTags.add(t));
  }

  // 6. 跨類最多 3 個（按 amount 排序）
  const final = afterMutex.sort((a, b) => b.amount - a.amount).slice(0, CART_LEVEL_MAX_DISCOUNTS);
  const totalDiscount = final.reduce((sum, r) => sum + r.amount, 0);

  return { applied: final, totalDiscount };
}
