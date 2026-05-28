import config from '@payload-config';
import { verifyTotp } from '@saas-factory/auth';
import { getPayload } from 'payload';

import {
  TOTP_SESSION_COOKIE_NAME,
  TOTP_SESSION_MAX_AGE_SECONDS,
  issueTotpSessionToken,
} from '@/lib/security/totp-session-cookie';

/**
 * POST /api/auth/totp/login-verify
 *
 * 登入後第二步：使用者已用密碼登入（Payload session 已建立），
 * 但 owner/admin 在 enforcement 期內必須先過 TOTP 才放行進後台。
 *
 * 此端點比對 TOTP 並**在成功時設置 `sf-totp-session` HMAC-signed cookie**，
 * 由 `middleware.ts` 在 /admin/* 等受保護路徑檢查。
 *
 * 不在 setup-verify 後用：那是「啟用流程」結尾比對；本端點是「日常登入」用。
 *
 * body: `{ token: '123456' }`
 *
 * 回傳：`{ ok: true }` + `Set-Cookie: sf-totp-session=...`
 */
export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({ config });
  const authResult = await payload.auth({ headers: request.headers });
  const user = authResult.user;
  if (!user) {
    return Response.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
  }

  const totpEnabled = Boolean((user as { totpEnabled?: unknown }).totpEnabled);
  const totpSecret = (user as { totpSecret?: unknown }).totpSecret;
  if (!totpEnabled || typeof totpSecret !== 'string') {
    return Response.json({ ok: false, error: '尚未啟用 2FA' }, { status: 400 });
  }

  let body: { token?: unknown };
  try {
    body = (await request.json()) as { token?: unknown };
  } catch {
    return Response.json({ ok: false, error: 'body 非 JSON' }, { status: 400 });
  }
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  if (!/^\d{6}$/.test(token)) {
    return Response.json({ ok: false, error: 'token 必須 6 位數字' }, { status: 400 });
  }

  if (!verifyTotp(totpSecret, token)) {
    return Response.json({ ok: false, error: 'TOTP 驗證碼錯誤' }, { status: 400 });
  }

  const sessionSecret = process.env.TOTP_SESSION_SECRET ?? process.env.PAYLOAD_SECRET ?? '';
  if (!sessionSecret) {
    return Response.json(
      { ok: false, error: 'TOTP_SESSION_SECRET 與 PAYLOAD_SECRET 皆未設定' },
      { status: 500 },
    );
  }

  const cookieValue = issueTotpSessionToken(sessionSecret, String(user.id));
  const cookieAttrs = [
    `${TOTP_SESSION_COOKIE_NAME}=${cookieValue}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${TOTP_SESSION_MAX_AGE_SECONDS}`,
  ];
  if (process.env.NODE_ENV === 'production') {
    cookieAttrs.push('Secure');
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieAttrs.join('; '),
    },
  });
}
