import type { CustomerProfile, Predicate } from './types.js';

const DAY = 24 * 60 * 60 * 1000;

/** 內建單段欄位白名單，避免使用者打錯字（例：'totalSpent'）被誤導到 customAttrs。 */
const BUILTIN_FIELDS = new Set([
  'tags',
  'totalSpentMinor',
  'totalOrders',
  'lifecycleStage',
  'lastOrderAt',
  'lastViewedAt',
  'lastAddedToCartAt',
  'daysSinceLastOrder',
]);

/** 已知的命名空間前綴。 */
const NAMESPACE_PREFIXES = new Set(['customAttrs', 'consents']);

/**
 * dot-path 取值（fail-closed）。
 *
 * - 單段 key：必須命中 BUILTIN_FIELDS，否則 throw。自訂屬性請用 `customAttrs.xxx`。
 * - 雙段 key：第一段必須是 NAMESPACE_PREFIXES 之一，否則 throw。
 *
 * 設計理由：早期版本對未知 key 預設 fallback 到 `customAttrs[key]`，
 * 會把 `totalSpent`（拼錯的 `totalSpentMinor`）這種錯誤靜默吞掉，
 * segment 整批客戶被誤判。改為 fail-closed 讓錯誤在建立 / 更新 segment 時即時暴露。
 */
export function getByPath(profile: CustomerProfile, path: string, now: Date): unknown {
  const parts = path.split('.');
  // 內建欄位
  if (parts.length === 1) {
    const key = parts[0]!;
    if (!BUILTIN_FIELDS.has(key)) {
      throw new Error(
        `未知 segment 欄位：${key}（自訂屬性請用 'customAttrs.${key}'；同意項請用 'consents.${key}'）`,
      );
    }
    switch (key) {
      case 'tags':
        return profile.tags;
      case 'totalSpentMinor':
        return profile.totalSpentMinor;
      case 'totalOrders':
        return profile.totalOrders;
      case 'lifecycleStage':
        return profile.lifecycleStage;
      case 'lastOrderAt':
        return profile.lastOrderAt;
      case 'lastViewedAt':
        return profile.lastViewedAt;
      case 'lastAddedToCartAt':
        return profile.lastAddedToCartAt;
      case 'daysSinceLastOrder':
        return profile.lastOrderAt
          ? (now.getTime() - profile.lastOrderAt.getTime()) / DAY
          : Number.POSITIVE_INFINITY;
    }
  }
  const head = parts[0]!;
  if (!NAMESPACE_PREFIXES.has(head)) {
    throw new Error(`未知 segment 欄位命名空間：${head}（支援：customAttrs、consents）`);
  }
  if (head === 'customAttrs') {
    return profile.customAttrs?.[parts[1]!];
  }
  return profile.consents?.[parts[1] as keyof NonNullable<CustomerProfile['consents']>];
}

/** 評估 predicate 對 profile。 */
export function evalPredicate(p: Predicate, profile: CustomerProfile, now: Date): boolean {
  switch (p.op) {
    case 'all':
      return p.of.every((c) => evalPredicate(c, profile, now));
    case 'any':
      return p.of.some((c) => evalPredicate(c, profile, now));
    case 'not':
      return !evalPredicate(p.of, profile, now);
  }
  const v = getByPath(profile, p.field, now);
  switch (p.op) {
    case 'eq':
      return v === p.value;
    case 'neq':
      return v !== p.value;
    case 'gt':
      return typeof v === 'number' && typeof p.value === 'number' && v > p.value;
    case 'gte':
      return typeof v === 'number' && typeof p.value === 'number' && v >= p.value;
    case 'lt':
      return typeof v === 'number' && typeof p.value === 'number' && v < p.value;
    case 'lte':
      return typeof v === 'number' && typeof p.value === 'number' && v <= p.value;
    case 'in':
      return Array.isArray(p.value) && p.value.includes(v as never);
    case 'not-in':
      return Array.isArray(p.value) && !p.value.includes(v as never);
    case 'has-tag':
      return Array.isArray(v) && typeof p.value === 'string' && v.includes(p.value);
    case 'within-days': {
      if (!(v instanceof Date) || typeof p.value !== 'number') return false;
      return (now.getTime() - v.getTime()) / DAY <= p.value;
    }
    case 'older-than-days': {
      if (!(v instanceof Date) || typeof p.value !== 'number') return false;
      return (now.getTime() - v.getTime()) / DAY > p.value;
    }
  }
}
