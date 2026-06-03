/**
 * 將 prompt template 內的 `{{var}}` 佔位符替換為實際值。
 *
 * - 未提供的變數會保留原始佔位符（不 throw），方便 caller 決定要不要再補。
 * - 變數名稱限定 `[A-Za-z0-9_]`，避免吃到正則特殊字元。
 *
 * @example
 * renderPromptTemplate('Hi {{name}}', { name: 'Alex' }) // → 'Hi Alex'
 */
export function renderPromptTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (match, key: string) => {
    if (Object.prototype.hasOwnProperty.call(variables, key)) {
      return variables[key] ?? match;
    }
    return match;
  });
}
