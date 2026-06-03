import { getVisibleFields } from './conditional.js';

import type { FormField } from './types.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\-\d\s()]{6,}$/;

/**
 * 驗證表單值。回傳「欄位 key → 錯誤訊息」。
 * 隱藏欄位不會被驗證。
 */
export function validateValues(
  fields: FormField[],
  values: Record<string, unknown>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const visible = getVisibleFields(fields, values);
  for (const f of visible) {
    const v = values[f.key];
    const isEmpty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
    if (f.required && isEmpty) {
      errors[f.key] = `${f.label} 為必填`;
      continue;
    }
    if (isEmpty) continue;

    if (f.type === 'email' && typeof v === 'string' && !EMAIL_RE.test(v)) {
      errors[f.key] = `${f.label} 格式錯誤`;
      continue;
    }
    if (f.type === 'phone' && typeof v === 'string' && !PHONE_RE.test(v)) {
      errors[f.key] = `${f.label} 格式錯誤`;
      continue;
    }
    if (f.type === 'number' && typeof v === 'number') {
      if (f.min !== undefined && v < f.min) {
        errors[f.key] = `${f.label} 不能小於 ${f.min}`;
        continue;
      }
      if (f.max !== undefined && v > f.max) {
        errors[f.key] = `${f.label} 不能大於 ${f.max}`;
        continue;
      }
    }
    if (typeof v === 'string') {
      if (f.minLength !== undefined && v.length < f.minLength) {
        errors[f.key] = `${f.label} 至少需要 ${f.minLength} 個字元`;
        continue;
      }
      if (f.maxLength !== undefined && v.length > f.maxLength) {
        errors[f.key] = `${f.label} 不能超過 ${f.maxLength} 個字元`;
        continue;
      }
    }
    if (f.type === 'consent' && v !== true) {
      errors[f.key] = `${f.label} 必須勾選同意`;
      continue;
    }
    if ((f.type === 'select' || f.type === 'radio') && f.options) {
      const allowed = new Set(f.options.map((o) => o.value));
      if (typeof v === 'string' && !allowed.has(v)) {
        errors[f.key] = `${f.label} 選項不合法`;
      }
    }
  }
  return errors;
}
