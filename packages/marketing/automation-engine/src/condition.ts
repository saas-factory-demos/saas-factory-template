import type { Condition, ConditionLeaf } from './types.js';

/** 從巢狀 object 用 dot-path 取值。 */
function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined), obj);
}

function evalLeaf(leaf: ConditionLeaf, ctx: Record<string, unknown>): boolean {
  const actual = getByPath(ctx, leaf.field);
  switch (leaf.op) {
    case 'eq':
      return actual === leaf.value;
    case 'neq':
      return actual !== leaf.value;
    case 'gt':
      return typeof actual === 'number' && typeof leaf.value === 'number' && actual > leaf.value;
    case 'gte':
      return typeof actual === 'number' && typeof leaf.value === 'number' && actual >= leaf.value;
    case 'lt':
      return typeof actual === 'number' && typeof leaf.value === 'number' && actual < leaf.value;
    case 'lte':
      return typeof actual === 'number' && typeof leaf.value === 'number' && actual <= leaf.value;
    case 'in':
      return Array.isArray(leaf.value) && leaf.value.includes(actual);
    case 'not-in':
      return Array.isArray(leaf.value) && !leaf.value.includes(actual);
    case 'exists':
      return actual !== undefined && actual !== null;
    case 'not-exists':
      return actual === undefined || actual === null;
  }
}

/** 遞迴判定條件是否成立。 */
export function evalCondition(cond: Condition, ctx: Record<string, unknown>): boolean {
  if ('all' in cond) return cond.all.every((c) => evalCondition(c, ctx));
  if ('any' in cond) return cond.any.some((c) => evalCondition(c, ctx));
  if ('not' in cond) return !evalCondition(cond.not, ctx);
  return evalLeaf(cond, ctx);
}
