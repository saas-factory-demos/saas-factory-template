import config from '@payload-config';
import { check2FAEnforcement } from '@saas-factory/auth';
import { getPayload } from 'payload';

/**
 * GET /api/auth/2fa-status
 *
 * 已登入 user 查詢自身 2FA 狀態（前端 banner / setup wizard 用）。
 *
 * 回傳：
 * ```
 * {
 *   ok: true,
 *   enforcement: EnforcementResult,
 *   totpEnabled: boolean,
 *   passkeyCount: number,
 * }
 * ```
 */
export async function GET(request: Request): Promise<Response> {
  const payload = await getPayload({ config });
  const authResult = await payload.auth({ headers: request.headers });
  const user = authResult.user;
  if (!user) {
    return Response.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
  }

  const passkeys = await payload.count({
    collection: 'user-credentials',
    where: { user: { equals: user.id } },
  });
  const passkeyCount = passkeys.totalDocs;
  const totpEnabled = Boolean((user as { totpEnabled?: unknown }).totpEnabled);
  const role = String((user as { role?: unknown }).role ?? '');
  const createdAtRaw = (user as { createdAt?: unknown }).createdAt;
  const createdAt =
    typeof createdAtRaw === 'string' || createdAtRaw instanceof Date
      ? new Date(createdAtRaw)
      : new Date();

  const enforcement = check2FAEnforcement({
    role,
    createdAt,
    totpEnabled,
    passkeyCount,
  });

  return Response.json({
    ok: true,
    enforcement,
    totpEnabled,
    passkeyCount,
  });
}
