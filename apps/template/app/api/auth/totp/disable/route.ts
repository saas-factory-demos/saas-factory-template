import config from '@payload-config';
import { verifyTotp } from '@saas-factory/auth';
import { getPayload } from 'payload';

/**
 * POST /api/auth/totp/disable
 *
 * 停用 TOTP 2FA。為防被動 hijack session 直接關 2FA，要求送現行 TOTP 碼驗證。
 *
 * body: `{ token: '123456' }`
 *
 * 對 owner / admin 的角色 enforcement 由前端 enforcement banner 提示
 * （見 `/api/auth/2fa-status`）；此端點不檢查角色，純資料層操作。
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

  try {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        totpSecret: null,
        totpEnabled: false,
        totpEnabledAt: null,
        recoveryCodes: null,
      } as Record<string, unknown>,
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : 'update failed' },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
