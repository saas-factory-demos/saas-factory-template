import { timingSafeEqual } from 'node:crypto';

import config from '@payload-config';
import { getPayload } from 'payload';

/**
 * Factory → Template health-orders endpoint。
 *
 * 回傳最近 24h 訂單數，供 factory dashboard 聚合健康度（見 apps/factory/lib/health.ts
 * `HttpHealthProbe.fetchOrders`）。
 *
 * 安全機制：
 * 1. `FACTORY_ADMIN_TOKEN` 未設定 → fail-closed（503，不開放查詢）
 * 2. Bearer token 走 `timingSafeEqual` 常數時間比對（避免 timing attack 推測 token）
 *
 * 容錯設計：
 * - 模板目前沒 'orders' collection（電商 / 訂單由各 client app 自選擴充）。
 *   collection 不存在或查詢失敗時，回 `count: 0 + available: false + reason`，
 *   factory 端可知道「客戶站沒裝訂單模組」而非「客戶站壞了」。
 */
export async function GET(request: Request): Promise<Response> {
  const expected = process.env.FACTORY_ADMIN_TOKEN;
  if (!expected) {
    return Response.json(
      { ok: false, error: 'FACTORY_ADMIN_TOKEN 未設定，health-orders endpoint 不開放' },
      { status: 503 },
    );
  }

  const authz = request.headers.get('authorization') ?? '';
  const presented = authz.startsWith('Bearer ') ? authz.slice('Bearer '.length) : '';
  if (!constantTimeEqual(presented, expected)) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let payload;
  try {
    payload = await getPayload({ config });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        count: 0,
        available: false,
        reason: 'payload-init-failed',
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }

  // 模板預設不含 orders collection；以動態 slug 查詢避免型別硬綁。
  // collection 不存在 → fail-soft 回 available: false，factory 端視為「無訂單模組」而非異常。
  try {
    const result = await payload.count({
      collection: 'orders' as never,
      where: { createdAt: { greater_than: since } },
    });
    return Response.json({ ok: true, count: result.totalDocs, available: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({
      ok: true,
      count: 0,
      available: false,
      reason: 'collection-missing',
      detail: message,
    });
  }
}

/**
 * 常數時間字串比對（避免 timing attack）。
 *
 * 長度不同時直接回 false（單純避免 buffer 長度錯誤；攻擊者可從長度差異推測 token
 * 長度，但 token 長度通常固定且公開）。
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
}
