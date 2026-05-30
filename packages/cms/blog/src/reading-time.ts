/**
 * 估算閱讀時間（分鐘，向上取整，最少 1 分鐘）。
 * - 中文：每分鐘 ~ 300 字
 * - 英文：每分鐘 ~ 250 字
 * - 混合內容：分別計算後加總
 */
export function estimateReadingTime(plainText: string): number {
  if (!plainText) return 1;
  const cjkChars = (plainText.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const englishWords = (
    plainText
      .replace(/[\u4e00-\u9fa5]/g, ' ')
      .match(/[A-Za-z0-9]+/g) ?? []
  ).length;
  const minutes = cjkChars / 300 + englishWords / 250;
  return Math.max(1, Math.ceil(minutes));
}

/**
 * 從 Lexical 序列化 JSON 萃取純文字（簡化版：遞迴所有 `text` 欄位）。
 */
export function extractPlainText(content: unknown): string {
  const parts: string[] = [];
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;
    const obj = node as Record<string, unknown>;
    if (typeof obj.text === 'string') parts.push(obj.text);
    const children = obj.children;
    if (Array.isArray(children)) {
      for (const c of children) walk(c);
    }
    const root = obj.root;
    if (root) walk(root);
  };
  walk(content);
  return parts.join(' ');
}
