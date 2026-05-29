import { createHmac, timingSafeEqual } from 'node:crypto';

export {
  TOTP_SESSION_COOKIE_NAME,
  TOTP_SESSION_MAX_AGE_SECONDS,
} from './totp-session-cookie-name';

import { TOTP_SESSION_MAX_AGE_SECONDS } from './totp-session-cookie-name';

/**
 * TOTP session-verified cookie。
 *
 * 為何用 parallel signed cookie 而非 JWT custom claim：
 * - TOTP 驗證是「**本 session** 已通過第二步」的事實，不是 user 屬性。
 * - 同一使用者在 5 個裝置登入，只有「驗過 TOTP 那台」應該被視為已過第二步。
 * - JWT claim 是 user-level（同一 user 任何 session 都帶相同 claim），無法表達 session-level 狀態。
 * - 自簽 cookie 與 Payload 的 `payload-token` 平行存在，互不污染。
 *
 * 流程：
 * 1. 使用者帳密登入 → Payload 設 `payload-token`（無 2FA claim）
 * 2. middleware 偵測 owner/admin + `totpEnabled=true` 但缺本 cookie → 導去 /2fa-challenge
 * 3. /2fa-challenge 呼叫 /api/auth/totp/login-verify → 比對成功後設 `sf-totp-session`
 * 4. 後續存取 /admin/* 過 middleware 即放行
 *
 * 安全性：
 * - HMAC SHA-256（fail-closed 未設 secret 直拒）
 * - 與 payload session 同壽（7 天），可獨立 invalidate（logout 時可清）
 * - `timingSafeEqual` 常數時間比對
 * - userId 綁定：cookie 解出的 userId 必須等於當前 payload session 的 userId，否則作廢
 *   （防同瀏覽器切帳號時舊 cookie 仍有效）
 */

export interface TotpSessionPayload {
  userId: string;
  iat: number;
}

export function issueTotpSessionToken(secret: string, userId: string): string {
  if (!secret) {
    throw new Error('TOTP_SESSION_SECRET 未設定');
  }
  const payload: TotpSessionPayload = { userId, iat: Date.now() };
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = sign(secret, body);
  return `${body}.${sig}`;
}

export function verifyTotpSessionToken(
  secret: string,
  cookieValue: string | undefined,
  expected: { userId: string; now?: number },
): TotpSessionPayload | null {
  if (!secret || !cookieValue) return null;
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;

  const expectedSig = sign(secret, body);
  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  let payload: TotpSessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TotpSessionPayload;
  } catch {
    return null;
  }
  if (typeof payload !== 'object' || payload === null) return null;
  if (typeof payload.userId !== 'string') return null;
  if (typeof payload.iat !== 'number') return null;

  if (payload.userId !== expected.userId) return null;
  const now = expected.now ?? Date.now();
  if (now - payload.iat > TOTP_SESSION_MAX_AGE_SECONDS * 1000) return null;

  return payload;
}

function sign(secret: string, body: string): string {
  return createHmac('sha256', secret).update(body).digest().toString('base64url');
}
