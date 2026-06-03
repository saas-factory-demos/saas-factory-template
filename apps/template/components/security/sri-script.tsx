import Script, { type ScriptProps } from 'next/script';

import type { ReactElement } from 'react';

interface SriScriptProps extends Omit<ScriptProps, 'src'> {
  /** 第三方 JS 完整 URL（含版本） */
  src: string;
  /** SRI hash（格式 `sha384-XXXX...`），用 lib/security/sri.ts 預先算 */
  integrity: string;
  /** 載入策略：預設 afterInteractive，避免阻塞首屏 */
  strategy?: ScriptProps['strategy'];
}

/**
 * 帶 SRI 的第三方 script wrapper。
 *
 * 強制要求 `integrity` 屬性，避免開發者誤把 vanilla `<script>` 拿來引第三方 JS。
 *
 * 對「不適合 SRI」的 SDK（GTM / Pixel / LIFF），直接用 `next/script` 並寫進
 * `middleware.ts` 的 CSP allowlist 即可，**不要**在這裡偽造 integrity。
 *
 * @example
 * ```tsx
 * <SriScript
 *   src="https://cdn.jsdelivr.net/npm/alpinejs@3.13.0/dist/cdn.min.js"
 *   integrity="sha384-...（用 lib/security/sri.ts 預先算）"
 *   strategy="afterInteractive"
 * />
 * ```
 */
export function SriScript({
  src,
  integrity,
  strategy = 'afterInteractive',
  ...rest
}: SriScriptProps): ReactElement {
  return (
    <Script
      {...rest}
      src={src}
      integrity={integrity}
      crossOrigin="anonymous"
      strategy={strategy}
    />
  );
}
