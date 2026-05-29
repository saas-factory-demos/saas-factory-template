import { createHash } from 'node:crypto';

/**
 * Subresource Integrity（SRI）工具：為第三方 CDN script / link 計算 sha384 雜湊。
 *
 * 使用情境：
 * - **可用**：靜態檔（指定版本的 jQuery、Alpine、特定 hash 的 lib，例如 cdnjs / unpkg @1.2.3）
 * - **不可用**：自動更新的服務型 SDK，因 vendor 經常熱更新 chunk hash 會變：
 *   - Google Tag Manager（`gtm.js`、`gtag.js`）
 *   - Meta Pixel（`fbevents.js`）
 *   - LINE Tag、LIFF SDK
 *   - Stripe.js、TapPay
 *
 *   這些 SDK 文件明確說「不要對主 entry 加 SRI」。對應防護改為 CSP allowlist
 *   （見 `apps/template/middleware.ts` 的 script-src）。
 *
 * 使用方式（build-time 計算後寫入 ENV 或常數）：
 * ```ts
 * const hash = await fetchAndHashSri('https://cdn.example.com/lib@1.2.3/dist/lib.min.js');
 * console.log(hash); // sha384-XXXX...
 * ```
 */

/**
 * 對給定字串內容計算 SRI sha384 雜湊字串。
 */
export function computeSriHash(content: string | Buffer): string {
  const hash = createHash('sha384').update(content).digest('base64');
  return `sha384-${hash}`;
}

/**
 * 從 URL 抓取資源並計算 SRI 雜湊。
 *
 * 注意：僅供 build-time / 一次性產 hash 使用，**不要**放在 request path。
 * 不在 runtime 計算原因：
 * 1. CDN 內容可能變動，runtime 重算等於停用 SRI 保護
 * 2. 每次 request 都打 CDN 會拖慢首屏
 *
 * @throws 若 HTTP 非 2xx 直接 throw
 */
export async function fetchAndHashSri(url: string): Promise<string> {
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: '*/*' },
  });
  if (!res.ok) {
    throw new Error(`SRI 抓檔失敗：${url} → ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return computeSriHash(buf);
}
