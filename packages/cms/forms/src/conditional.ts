import type { ConditionRule, ConditionalLogic, FormField } from './types.js';

/**
 * 評估單一條件規則。
 */
export function evaluateRule(rule: ConditionRule, values: Record<string, unknown>): boolean {
  const v = values[rule.fieldKey];
  switch (rule.operator) {
    case 'equals':
      return v === rule.value;
    case 'not-equals':
      return v !== rule.value;
    case 'in':
      return Array.isArray(rule.value) && rule.value.includes(v as never);
    case 'not-in':
      return !(Array.isArray(rule.value) && rule.value.includes(v as never));
    case 'truthy':
      return Boolean(v);
    case 'falsy':
      return !v;
  }
}

/**
 * 評估整組條件邏輯，回傳「該欄位是否應顯示」。
 */
export function isFieldVisible(
  logic: ConditionalLogic | undefined,
  values: Record<string, unknown>,
): boolean {
  if (!logic) return true;
  const matches = logic.rules.map((r) => evaluateRule(r, values));
  const ok = logic.match === 'all' ? matches.every(Boolean) : matches.some(Boolean);
  return logic.action === 'show' ? ok : !ok;
}

/**
 * 回傳目前 values 下「可見」的欄位列表（驗證時跳過隱藏欄位）。
 */
export function getVisibleFields(
  fields: FormField[],
  values: Record<string, unknown>,
): FormField[] {
  return fields.filter((f) => isFieldVisible(f.conditional, values));
}
