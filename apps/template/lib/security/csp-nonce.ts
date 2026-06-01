/**
 * CSP nonce 工具（對應 99.4-CSP-2 'strict-dynamic' + nonce 升級準備）。
 *
 * 階段策略（Report-Only 漸進升級）：
 *
 * 1. **目前（預設）**：CSP-1 模式，`script-src 'self' 'unsafe-inline' 'unsafe-eval' <hosts>`
 *    — Report-Only 蒐集違規，已運作數版
 * 2. **本檔提供（opt-in）**：`CSP_STRICT_DYNAMIC_REPORT_ONLY=true` 啟用 nonce 注入
 *    — Report-Only 模式併行觀察 strict-dynamic 下會誤判多少現有 script
 *    — 不影響 enforce 模式（仍走 CSP-1 規則）
 * 3. **未來（待 next/script 全面接 nonce）**：切換為強制模式
 *
 * 為何 nonce 用 base64url：CSP 規範允許任何 ASCII，base64url 避開 = / + 等
 * URL-unsafe 字元，便於日後與 query string 互通。長度 16 byte = 128 bit
 * 熵足夠抗暴破。
 *
 * **本 helper 必須在 middleware（edge runtime）跑**，因此用 Web Crypto API（globalThis.crypto），
 * 不可 import 'node:crypto'。
 */

/** 產一個全新的 CSP nonce（per request）。 */
export function generateCspNonce(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  // base64url：先 btoa，再 +/= → -_/去掉
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Request header 名稱：middleware 注入後，下游 Server Components 可用 headers() 讀。 */
export const CSP_NONCE_HEADER = 'x-csp-nonce';

/**
 * 是否啟用 strict-dynamic + nonce（Report-Only 觀察用）。
 *
 * 預設 false，必須顯式設 `CSP_STRICT_DYNAMIC_REPORT_ONLY=true` 才啟用，
 * 避免本機 dev / production CI 預設行為改變。
 */
export function isStrictDynamicReportingEnabled(): boolean {
  return process.env.CSP_STRICT_DYNAMIC_REPORT_ONLY === 'true';
}

/**
 * 給 buildCsp 用的 script-src 段組合器。
 *
 * - 預設（CSP-1）：`'self' 'unsafe-inline' 'unsafe-eval' <hosts>`
 * - strict-dynamic 開啟（CSP-2 Report-Only）：
 *   `'self' 'strict-dynamic' 'nonce-XXX' 'unsafe-inline' <hosts>`
 *   - 為何保留 'unsafe-inline'：當瀏覽器**不支援** strict-dynamic（舊 Safari）→ 落到 host
 *     whitelist；當瀏覽器**支援** strict-dynamic → 自動忽略 'unsafe-inline'。
 *   - 為何拿掉 'unsafe-eval'：strict-dynamic 階段刻意收緊，eval / new Function() 不應再需要。
 */
export function buildScriptSrc(opts: {
  hosts: readonly string[];
  nonce?: string;
}): string[] {
  if (opts.nonce && isStrictDynamicReportingEnabled()) {
    return [
      "'self'",
      "'strict-dynamic'",
      `'nonce-${opts.nonce}'`,
      "'unsafe-inline'", // 舊瀏覽器 fallback
      ...opts.hosts,
    ];
  }
  return ["'self'", "'unsafe-inline'", "'unsafe-eval'", ...opts.hosts];
}
