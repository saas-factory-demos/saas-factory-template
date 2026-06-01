/**
 * 轉義 XML 特殊字元（& < > " '）。
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 轉義 CSV 欄位：若包含逗號 / 引號 / 換行則用雙引號包住，雙引號用兩個引號轉義。
 */
export function escapeCsv(value: string): string {
  if (value === '') return '';
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * 把欄位陣列組成 CSV 行（自動轉義 + 逗號分隔 + 換行）。
 */
export function csvRow(fields: (string | undefined)[]): string {
  return fields.map((f) => escapeCsv(f ?? '')).join(',');
}
