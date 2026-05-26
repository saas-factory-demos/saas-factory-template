import config from '@payload-config';
import {
  generateRecoveryCodes,
  hashRecoveryCode,
  verifyTotp,
} from '@saas-factory/auth';
import { getPayload } from 'payload';

/**
 * POST /api/auth/totp/recovery-regenerate
 *
 * 重新產 10 組救援碼。已啟用 2FA 才能呼叫；要送現行 TOTP 確認本人。
 *
 * - 回明碼 codes（**僅此一次顯示，前端必須提示使用者抄寫**）
 * - DB 只存 hashed 版本；舊救援碼自動作廢
 *
 * body: `{ token: '123456' }`
 *
 * 回傳：`{ ok: true, recoveryCodes: string[] }`
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

  const codes = generateRecoveryCodes(10);
  const hashed = codes.map(hashRecoveryCode);

  try {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { recoveryCodes: hashed } as Record<string, unknown>,
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : 'update failed' },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, recoveryCodes: codes });
}
