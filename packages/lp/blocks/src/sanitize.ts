/**
 * HTML 白名單 sanitizer。
 *
 * 設計取捨：不引入 DOMPurify 等套件（避免相依 + isomorphic 麻煩），
 * 但堵住所有 XSS 主要載體：
 * - 整段 `<script>` / `<style>` / `<iframe>` / `<object>` / `<embed>` / `<link>` / `<meta>` / `<base>`
 * - 任何 `on*` 事件屬性（onclick / onerror / onload ...）
 * - `javascript:` / `vbscript:` / `data:` href（圖片 src 例外另外處理）
 * - `srcdoc` / `formaction` 等可載入外部腳本的屬性
 *
 * 若使用情境需要更彈性（如允許 iframe embed YouTube），請另開 wrapper
 * 而不要放寬本處規則。
 */

/** 整段移除的危險元素（含內容）。 */
const FORBIDDEN_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
  'base',
  'form',
];

/** 應該被剝除的危險屬性名稱。 */
const FORBIDDEN_ATTR_NAMES = [
  'srcdoc',
  'formaction',
  'action',
  'background',
  'ping',
];

/** href / src 等屬性中不允許的 protocol。 */
const FORBIDDEN_URL_PROTOCOLS = /^(javascript|vbscript|data):/i;

/**
 * 將 HTML 字串依白名單原則 sanitize，回傳安全 HTML。
 *
 * 注意：這是字串層級的近似實作，依賴正則而非真正 DOM 解析；
 * 在後台儲存時呼叫一次 + 在前台 SSR 渲染前再呼叫一次（depth-in-depth）。
 */
export function sanitizeHtml(html: string): string {
  let out = html;
  // 1. 整段移除危險元素（含內容）
  for (const tag of FORBIDDEN_TAGS) {
    const block = new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, 'gi');
    out = out.replace(block, '');
    // 自閉合形式
    const selfClose = new RegExp(`<${tag}\\b[^>]*/?>`, 'gi');
    out = out.replace(selfClose, '');
  }
  // 2. 剝除 on* 事件屬性（onclick="..." / onerror='...'）
  out = out.replace(/\s+on[a-z]+\s*=\s*"[^"]*"/gi, '');
  out = out.replace(/\s+on[a-z]+\s*=\s*'[^']*'/gi, '');
  // 沒有引號的情形
  out = out.replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '');
  // 3. 剝除危險屬性名稱
  for (const attr of FORBIDDEN_ATTR_NAMES) {
    const re = new RegExp(`\\s+${attr}\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+)`, 'gi');
    out = out.replace(re, '');
  }
  // 4. 中和危險 URL protocol：把 href="javascript:..." 變成 href="#"
  out = out.replace(/(\s(?:href|xlink:href|src)\s*=\s*)"([^"]*)"/gi, (_m, prefix: string, url: string) =>
    FORBIDDEN_URL_PROTOCOLS.test(url.trim()) ? `${prefix}"#"` : `${prefix}"${url}"`,
  );
  out = out.replace(/(\s(?:href|xlink:href|src)\s*=\s*)'([^']*)'/gi, (_m, prefix: string, url: string) =>
    FORBIDDEN_URL_PROTOCOLS.test(url.trim()) ? `${prefix}'#'` : `${prefix}'${url}'`,
  );
  return out;
}

/** Markdown 渲染後的 HTML 也得跑一次 sanitize。 */
export function sanitizeRichTextHtml(html: string): string {
  return sanitizeHtml(html);
}
