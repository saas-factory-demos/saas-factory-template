import config from '@payload-config';
import { verifyAndConsumeRecoveryCode } from '@saas-factory/auth';
import { getPayload } from 'payload';

import {
  TOTP_SESSION_COOKIE_NAME,
  TOTP_SESSION_MAX_AGE_SECONDS,
  issueTotpSessionToken,
} from '@/lib/security/totp-session-cookie';

/**
 * POST /api/auth/totp/recovery-verify
 *
 * 用 recovery code 取代 TOTP（authenticator 裝置遺失 fallback）。
 *
 * - 比對 + 消耗一組 hashed recovery code（成功就從陣列移除）
 * - 用完的剩餘 codes 寫回 user.recoveryCodes
 * - 不關 2FA，僅作為本次登入挑戰通過（caller 後續通常引導使用者重設 TOTP）
 * - 成功時同樣 Set-Cookie `sf-totp-session`，讓 middleware 放行進 /admin/*
 *
 * body: `{ code: 'ABCD-1234' }`
 *
 * 回傳：`{ ok: true, remaining: number }` + `Set-Cookie: sf-totp-session=...`
 */
export async function POST(request: Request): Promise<Response> {
  const payload = await getPayload({ config });
  const authResult = await payload.auth({ headers: request.headers });
  const user = authResult.user;
  if (!user) {
    return Response.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
  }

  const stored = (user as { recoveryCodes?: unknown }).recoveryCodes;
  if (!Array.isArray(stored) || stored.length === 0) {
    return Response.json({ ok: false, error: '無可用 recovery code' }, { status: 400 });
  }
  const hashedCodes = stored.filter((v): v is string => typeof v === 'string');

  let body: { code?: unknown };
  try {
    body = (await request.json()) as { code?: unknown };
  } catch {
    return Response.json({ ok: false, error: 'body 非 JSON' }, { status: 400 });
  }
  const code = typeof body.code === 'string' ? body.code : '';
  if (!code) {
    return Response.json({ ok: false, error: '缺 code' }, { status: 400 });
  }

  const remaining = verifyAndConsumeRecoveryCode(code, hashedCodes);
  if (remaining === null) {
    return Response.json({ ok: false, error: 'recovery code 錯誤' }, { status: 400 });
  }

  try {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { recoveryCodes: remaining } as Record<string, unknown>,
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : 'update failed' },
      { status: 500 },
    );
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

  return new Response(JSON.stringify({ ok: true, remaining: remaining.length }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookieAttrs.join('; '),
    },
  });
}
