/**
 * 從 Lexical-like 結構遞迴萃取純文字。
 */
export function extractPlainText(node: unknown): string {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string') return node;
  if (typeof node !== 'object') return '';
  const obj = node as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof obj.text === 'string') parts.push(obj.text);
  if (Array.isArray(obj.children)) {
    for (const c of obj.children) parts.push(extractPlainText(c));
  }
  if (obj.root) parts.push(extractPlainText(obj.root));
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
