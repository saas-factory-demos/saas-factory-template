import { NextResponse, type NextRequest } from 'next/server';

import { detectLocaleFromHeader, isSupportedLocale } from '@/lib/locale';
import {
  CSP_NONCE_HEADER,
  buildScriptSrc,
  generateCspNonce,
  isStrictDynamicReportingEnabled,
} from '@/lib/security/csp-nonce';
import { TOTP_SESSION_COOKIE_NAME } from '@/lib/security/totp-session-cookie-name';

/**
 * Content Security Policy 與安全 header 中介層。
 *
 * 策略：
 * - 預設 Report-Only 模式（CSP_ENFORCE 未設或為 false），不阻擋既有頁面，僅蒐集違規回報。
 *   觀察一週後若無誤報，再切換 `CSP_ENFORCE=true` 進入強制模式。
 * - Payload admin 路徑（/admin）暫不套 CSP，避免 React admin 內聯資源被誤判（v1.2 再處理）。
 * - 同時設定 Referrer-Policy、Permissions-Policy、X-Content-Type-Options、X-Frame-Options。
 *
 * Allowlist 涵蓋台灣常見分析／廣告 SDK：
 * - Google Analytics 4、Google Tag Manager
 * - Meta Pixel / Conversion API
 * - LINE LIFF / LINE Tag
 * - Cloudflare R2、Vercel image 子網域
 */

const ANALYTICS_SCRIPT_SRC = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://connect.facebook.net',
  'https://static.line-scdn.net',
  'https://*.line.me',
];

const ANALYTICS_CONNECT_SRC = [
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
  'https://www.google.com',
  'https://stats.g.doubleclick.net',
  'https://*.facebook.com',
  'https://*.facebook.net',
  'https://*.line.me',
];

/**
 * Sentry self-hosted ingest endpoint allowlist。
 *
 * - 主端點：Tailscale Funnel 暴露的 `openclaw-media-vm.tail4b24a0.ts.net`（見 `infra/sentry-self-hosted/README.md`）
 * - 通配 `*.ts.net` 留作 DR 切換到備援節點 / 換 tailnet 時的緩衝。
 *
 * 客戶站若改接自家 Sentry，可在 `SENTRY_CSP_CONNECT_SRC` 環境變數補上自家網域（以空白分隔）。
 */
const SENTRY_CONNECT_SRC = [
  'https://openclaw-media-vm.tail4b24a0.ts.net',
  'https://*.tail4b24a0.ts.net',
];

const IMG_SRC = [
  "'self'",
  'data:',
  'blob:',
  'https://*.r2.cloudflarestorage.com',
  'https://*.r2.dev',
  'https://*.vercel-storage.com',
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://*.facebook.com',
];

/**
 * 組合 CSP 字串。
 *
 * script-src 行為由 `buildScriptSrc` 決定：
 * - 預設（CSP-1）：`'self' 'unsafe-inline' 'unsafe-eval' <hosts>`
 * - 設定 `CSP_STRICT_DYNAMIC_REPORT_ONLY=true`（CSP-2 Report-Only 觀察階段）：
 *   `'self' 'strict-dynamic' 'nonce-XXX' 'unsafe-inline' <hosts>`
 *
 * 詳見 `lib/security/csp-nonce.ts`。
 */
function buildCsp(reportEndpoint: string, nonce: string | undefined): string {
  const extraSentryConnect = (process.env.SENTRY_CSP_CONNECT_SRC ?? '')
    .split(/\s+/)
    .filter(Boolean);

  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': buildScriptSrc({ hosts: ANALYTICS_SCRIPT_SRC, nonce }),
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': IMG_SRC,
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      'https:',
      'wss:',
      ...ANALYTICS_CONNECT_SRC,
      ...SENTRY_CONNECT_SRC,
      ...extraSentryConnect,
    ],
    'frame-src': ["'self'", 'https://*.facebook.com', 'https://*.line.me'],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'object-src': ["'none'"],
    'manifest-src': ["'self'"],
    'media-src': ["'self'", 'https://*.r2.dev', 'https://*.r2.cloudflarestorage.com', 'https://*.b-cdn.net'],
    'worker-src': ["'self'", 'blob:'],
    'upgrade-insecure-requests': [],
    'report-uri': [reportEndpoint],
  };

  return Object.entries(directives)
    .map(([key, values]) => (values.length === 0 ? key : `${key} ${values.join(' ')}`))
    .join('; ');
}

/**
 * 路徑是否該跳過 locale 處理。
 * - /admin：Payload 後台
 * - /api：API routes
 * - /_next、靜態檔：matcher 已排除多數，這裡再保險
 */
function shouldBypassLocale(pathname: string): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  );
}

/**
 * Locale prefix 處理：若 URL 第一段不在 SUPPORTED_LOCALES，依 Accept-Language redirect 加上前綴。
 */
function handleLocaleRouting(request: NextRequest): NextResponse | null {
  const { pathname, search } = request.nextUrl;
  if (shouldBypassLocale(pathname)) return null;

  const firstSegment = pathname.split('/')[1] ?? '';
  if (isSupportedLocale(firstSegment)) return null;

  const preferred = detectLocaleFromHeader(request.headers.get('accept-language'));

  const url = request.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === '/' ? '' : pathname}`;
  url.search = search;
  return NextResponse.redirect(url);
}

/**
 * Payload `payload-token` JWT 的 base64 payload 段解碼。
 *
 * **重要**：本函式不驗章。middleware 解碼只用於路由決策（要不要導去 2FA 挑戰頁），
 * 真正的權限把關仍由 Payload 的 `payload.auth()` 在伺服端執行。
 * 攻擊者偽造 token 最多繞過導向、但無法繞過 Payload 的伺服端驗章。
 *
 * 為何不在 middleware 驗章：edge runtime 不支援 node:crypto，
 * 引入 jose 又會把 secret 帶進邊緣環境，得不償失。
 */
function decodePayloadTokenPayload(token: string): {
  id?: string;
  role?: string;
  totpEnabled?: boolean;
  collection?: string;
} | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const body = parts[1];
  if (!body) return null;
  try {
    const json = atob(body.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(json) as Record<string, unknown>;
    return {
      id: typeof parsed.id === 'string' ? parsed.id : undefined,
      role: typeof parsed.role === 'string' ? parsed.role : undefined,
      totpEnabled: typeof parsed.totpEnabled === 'boolean' ? parsed.totpEnabled : undefined,
      collection: typeof parsed.collection === 'string' ? parsed.collection : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * 2FA 強制執行：owner/admin 且 totpEnabled=true 進 /admin/* 必須帶有效的 `sf-totp-session` cookie。
 *
 * 設計：
 * - 只在 totpEnabled=true 時要求挑戰：尚未啟用的 owner/admin 由頁面層導去 /2fa-setup（grace period 處理）。
 * - cookie 不在此驗章（HMAC verify 需 node:crypto），只看「存在」做路由；伺服端後續 API 會驗章。
 *   攻擊者偽造 cookie 過 middleware 但無法過後端，得不到實際好處。
 * - 已在挑戰頁面（/2fa-challenge）本身就不再轉導，避免無限迴圈。
 */
function require2FAForAdmin(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin')) return null;

  const tokenCookie = request.cookies.get('payload-token')?.value;
  if (!tokenCookie) return null; // 未登入由 Payload 自己擋

  const decoded = decodePayloadTokenPayload(tokenCookie);
  if (!decoded) return null;
  if (decoded.collection !== 'users') return null;
  if (decoded.role !== 'owner' && decoded.role !== 'admin') return null;
  if (!decoded.totpEnabled) return null; // 未啟用 2FA → 由頁面層 enforcement 處理（grace period）

  const sessionCookie = request.cookies.get(TOTP_SESSION_COOKIE_NAME)?.value;
  if (sessionCookie) return null;

  const url = request.nextUrl.clone();
  const locale = detectLocaleFromHeader(request.headers.get('accept-language'));
  url.pathname = `/${locale}/2fa-challenge`;
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

/**
 * Next.js 中介層：注入 CSP 與其他安全 header，並處理 locale prefix 重導。
 */
export function middleware(request: NextRequest): NextResponse {
  // 先處理 locale 重導（缺前綴 → redirect 加上偏好 locale）
  const localeRedirect = handleLocaleRouting(request);
  if (localeRedirect) return localeRedirect;

  // 2FA 強制執行：owner/admin + totpEnabled → 進 /admin/* 必須先過 TOTP 挑戰
  const twoFaRedirect = require2FAForAdmin(request);
  if (twoFaRedirect) return twoFaRedirect;

  // CSP-2 Report-Only 觀察：產生 per-request nonce 並透過 request header 傳給下游
  // RSC（用 headers() 讀），同時注入 CSP script-src。
  // 預設未啟用（沒設 CSP_STRICT_DYNAMIC_REPORT_ONLY=true）時，nonce 不會出現在 CSP，
  // 行為與 CSP-1 相同。
  const nonce = isStrictDynamicReportingEnabled() ? generateCspNonce() : undefined;
  const requestHeaders = new Headers(request.headers);
  if (nonce) requestHeaders.set(CSP_NONCE_HEADER, nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  const { pathname } = request.nextUrl;

  // /admin 路徑（Payload）暫不套 CSP，待 v1.2 再處理
  if (pathname.startsWith('/admin')) {
    return response;
  }

  const reportEndpoint = '/api/security/csp-report';
  const csp = buildCsp(reportEndpoint, nonce);
  const enforce = process.env.CSP_ENFORCE === 'true';

  response.headers.set(
    enforce ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only',
    csp,
  );
  // 把 nonce 也回應給瀏覽器，讓 client 端 script 能用同一個 nonce（debug 用）
  if (nonce) {
    response.headers.set(CSP_NONCE_HEADER, nonce);
  }
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=(self)',
  );

  return response;
}

/**
 * 中介層作用範圍：所有頁面與 API，但跳過靜態檔案與 Next 內部資源。
 */
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
