import type { FormDefinition, FormSubmission } from './types.js';

/**
 * 把提交紀錄匯出為 CSV 字串。
 * 欄位順序：createdAt, ...form.fields[].key
 */
export function exportSubmissionsCsv(
  form: FormDefinition,
  submissions: FormSubmission[],
): string {
  const headers = ['createdAt', ...form.fields.map((f) => f.key)];
  const lines: string[] = [headers.map(escapeCsv).join(',')];
  for (const s of submissions) {
    const row = [s.createdAt.toISOString(), ...form.fields.map((f) => formatCell(s.values[f.key]))];
    lines.push(row.map(escapeCsv).join(','));
  }
  return lines.join('\n');
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (Array.isArray(v)) return v.join('|');
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return String(v);
}

/**
 * 公式注入危險字元：Excel / LibreOffice 在儲存格首字是這些時會當公式執行，
 * 攻擊者可在表單填入 `=cmd|'/c calc'!A1` 等 payload，
 * 開啟 CSV 的後台人員會被攻擊（資料外洩、Macro 執行）。
 */
const CSV_FORMULA_LEADERS = ['=', '+', '-', '@', '\t', '\r'];

/**
 * 防公式注入：若儲存格首字是危險字元，前置 `'` 強制當文字。
 * 標準作法（OWASP CSV Injection 推薦）。
 */
function neutralizeFormula(value: string): string {
  if (value.length === 0) return value;
  return CSV_FORMULA_LEADERS.includes(value[0]!) ? `'${value}` : value;
}

function escapeCsv(value: string): string {
  const safe = neutralizeFormula(value);
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}
