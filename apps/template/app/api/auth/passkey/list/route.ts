import config from '@payload-config';
import { getPayload } from 'payload';

/**
 * GET /api/auth/passkey/list
 *
 * 已登入 user 查自己的 passkey 清單（管理用）。
 * 不回 publicKey / counter — 那是內部欄位，前端不需要。
 *
 * 回傳：
 * ```
 * {
 *   ok: true,
 *   credentials: Array<{
 *     id: string;
 *     credentialId: string;   // 前 16 字元預覽用，full id 不外露
 *     nickname: string | null;
 *     createdAt: string;       // ISO
 *     lastUsedAt: string | null;
 *   }>
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

  const res = await payload.find({
    collection: 'user-credentials',
    where: { user: { equals: user.id } },
    limit: 100,
    sort: '-createdAt',
  });

  const credentials = res.docs.map((doc) => {
    const d = doc as {
      id: string | number;
      credentialId?: unknown;
      nickname?: unknown;
      createdAt?: unknown;
      lastUsedAt?: unknown;
    };
    return {
      id: String(d.id),
      credentialId: typeof d.credentialId === 'string' ? d.credentialId : '',
      nickname: typeof d.nickname === 'string' ? d.nickname : null,
      createdAt:
        typeof d.createdAt === 'string'
          ? d.createdAt
          : d.createdAt instanceof Date
            ? d.createdAt.toISOString()
            : null,
      lastUsedAt:
        typeof d.lastUsedAt === 'string'
          ? d.lastUsedAt
          : d.lastUsedAt instanceof Date
            ? d.lastUsedAt.toISOString()
            : null,
    };
  });

  return Response.json({ ok: true, credentials });
}
