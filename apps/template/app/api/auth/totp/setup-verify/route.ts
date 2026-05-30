import config from '@payload-config';
import { hashRecoveryCode, verifyTotp } from '@saas-factory/auth';
import { getPayload } from 'payload';

import {
  TOTP_SETUP_COOKIE_NAME,
  verifyTotpSetupToken,
} from '@/lib/security/totp-setup-token';

/**
 * POST /api/auth/totp/setup-verify
 *
 * 已登入 user 完成 TOTP 設定第二步：送 6 位數碼驗證。
 *
 * - 從 setup cookie 解出 secret + recoveryCodes
 * - `verifyTotp` 通過後，把 secret + hashed recoveryCodes + totpEnabled=true + totpEnabledAt 寫進 user
 * - 清掉 setup cookie
 *
 * body: `{ token: '123456' }`
 */
export async function POST(request: Request): Promise<Response> {
  const setupSecret = process.env.TOTP_SETUP_SECRET;
  if (!setupSecret) {
    return Response.json(
      { ok: false, error: 'TOTP_SETUP_SECRET 未設定' },
      { status: 503 },
    );
  }

  const payload = await getPayload({ config });
  const authResult = await payload.auth({ headers: request.headers });
  const user = authResult.user;
  if (!user) {
    return Response.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
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

  const cookie = readCookie(request.headers.get('cookie'), TOTP_SETUP_COOKIE_NAME);
  const verified = verifyTotpSetupToken(setupSecret, cookie, {
    userId: String(user.id),
  });
  if (!verified) {
    return Response.json(
      { ok: false, error: 'setup token 過期或不存在，請重新啟動設定流程' },
      { status: 400 },
    );
  }

  if (!verifyTotp(verified.secret, token)) {
    return Response.json({ ok: false, error: 'TOTP 驗證碼錯誤' }, { status: 400 });
  }

  const hashedCodes = verified.recoveryCodes.map(hashRecoveryCode);

  try {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        totpSecret: verified.secret,
        totpEnabled: true,
        totpEnabledAt: new Date().toISOString(),
        recoveryCodes: hashedCodes,
      } as Record<string, unknown>,
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : 'update failed' },
      { status: 500 },
    );
  }

  return Response.json(
    { ok: true },
    {
      headers: {
        'set-cookie': clearCookie(),
      },
    },
  );
}

function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return rest.join('=');
  }
  return undefined;
}

function clearCookie(): string {
  return `${TOTP_SETUP_COOKIE_NAME}=; Path=/api/auth/totp; Max-Age=0; HttpOnly; SameSite=Strict; Secure`;
}
