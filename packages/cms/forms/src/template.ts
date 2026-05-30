/**
 * 樣板替換：把 `{{key}}` 換成 values[key] 的字串。
 * 找不到就替換為空字串。純文字用，不做 HTML escape。
 */
export function renderTemplate(tmpl: string, values: Record<string, unknown>): string {
  return tmpl.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key: string) => {
    const v = values[key];
    if (v === undefined || v === null) return '';
    return String(v);
  });
}

/**
 * 將樣板用於 HTML email body 時的替換：對 values 的內容做 HTML escape，
 * 樣板本身的 HTML 保持原樣（讓管理員自己掌握樣式）。
 *
 * 用途：表單通知 / 自動回覆信件正文，避免使用者輸入 `<script>` 等內容被當作 HTML 執行。
 */
export function renderTemplateHtml(tmpl: string, values: Record<string, unknown>): string {
  return tmpl.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key: string) => {
    const v = values[key];
    if (v === undefined || v === null) return '';
    return escapeHtml(String(v));
  });
}

/**
 * 把表單欄位值匯出成 HTML table 字串（用於 email 通知）。
 */
export function renderValuesHtml(values: Record<string, unknown>): string {
  const rows = Object.entries(values)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:600">${escapeHtml(k)}</td><td style="padding:4px 8px;border:1px solid #ddd">${escapeHtml(
          formatValue(v),
        )}</td></tr>`,
    )
    .join('');
  return `<table style="border-collapse:collapse">${rows}</table>`;
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (Array.isArray(v)) return v.join('、');
  if (typeof v === 'boolean') return v ? '是' : '否';
  return String(v);
}

/**
 * HTML escape：避免使用者輸入造成 XSS。
 * 同時 escape `'`，防止破壞屬性引號。
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
