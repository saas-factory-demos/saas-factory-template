import config from '@payload-config';
import { getPayload } from 'payload';

import { verifyBootstrapRequest } from '@/lib/factory-bootstrap-verify';

/**
 * Factory → Template bootstrap-admin endpoint。
 *
 * 一次性高權限操作：建立首個 admin user。安全機制：
 * 1. FACTORY_BOOTSTRAP_SECRET 未設定 → fail-closed（403）
 * 2. HMAC 簽章（method / path / timestamp / body）+ 5 分鐘時間漂移
 * 3. 已存在任何 user → 拒絕（避免重放後注入第二個 admin）
 *
 * 對應 factory 端：apps/factory/lib/admin-bootstrapper.ts
 */
export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const verifyResult = verifyBootstrapRequest({
    secret: process.env.FACTORY_BOOTSTRAP_SECRET,
    method: 'POST',
    path: '/api/factory/bootstrap-admin',
    rawBody,
    headers: {
      timestamp: request.headers.get('x-factory-timestamp'),
      signature: request.headers.get('x-factory-signature'),
    },
  });
  if (!verifyResult.ok) {
    const status =
      verifyResult.reason === 'config-missing'
        ? 403
        : verifyResult.reason === 'headers-missing' || verifyResult.reason === 'body-invalid'
          ? 400
          : 401;
    return Response.json(
      { ok: false, error: verifyResult.message, reason: verifyResult.reason },
      { status },
    );
  }

  const payload = await getPayload({ config });

  // 已有 user → 拒絕（bootstrap 僅供首次使用）
  const existing = await payload.count({ collection: 'users' });
  if (existing.totalDocs > 0) {
    return Response.json(
      { ok: false, error: 'admin 已存在，bootstrap 拒絕重複建立', reason: 'already-bootstrapped' },
      { status: 409 },
    );
  }

  try {
    await payload.create({
      collection: 'users',
      data: {
        email: verifyResult.body.adminEmail,
        password: verifyResult.body.adminPassword,
      },
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        reason: 'create-failed',
      },
      { status: 500 },
    );
  }

  return Response.json({
    ok: true,
    adminEmail: verifyResult.body.adminEmail,
    client: verifyResult.body.client,
  });
}
