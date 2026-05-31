import config from '@payload-config';
import { getPayload } from 'payload';

import { verifySeedPagesRequest } from '@/lib/factory-seed-pages-verify';
import {
  createPlaceholderMediaCache,
  pageCompositionsToPayloadPages,
  transformPayloadBlockForPayload,
} from '@/lib/payload-seed';

/**
 * Factory → Template seed-pages endpoint。
 *
 * 一次性內容初始化操作：把 wizard.frontend.pages 寫入 Payload `pages` collection。
 * 安全機制：
 * 1. FACTORY_BOOTSTRAP_SECRET 未設定 → fail-closed（403）
 * 2. HMAC 簽章（method / path / timestamp / body）+ 5 分鐘時間漂移
 * 3. 該 tenant 已有任何 page → 拒絕（避免重放後注入重複 / 覆蓋現有內容）
 *
 * 對應 factory 端：apps/factory/lib/page-seeder.ts
 *
 * 為何用 HMAC：與 bootstrap-admin 同等級操作（一次性寫權限），共用 FACTORY_BOOTSTRAP_SECRET
 * 避免額外密鑰維護成本。為何允許 already-seeded 是 409：第二次 generate 想換內容應走 admin UI
 * 編輯，而不是再呼叫此 endpoint（避免覆蓋客戶手改內容）。
 */
export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const verifyResult = verifySeedPagesRequest({
    secret: process.env.FACTORY_BOOTSTRAP_SECRET,
    method: 'POST',
    path: '/api/factory/seed-pages',
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
  const { tenantId, pages } = verifyResult.body;

  // 該 tenant 已有 page → 拒絕（seed 僅供首次使用，避免覆蓋客戶手改內容）
  const existing = await payload.count({
    collection: 'pages',
    where: { tenantId: { equals: tenantId } },
  });
  if (existing.totalDocs > 0) {
    return Response.json(
      {
        ok: false,
        error: `tenant ${tenantId} 已有 ${existing.totalDocs} 頁，seed 拒絕重複寫入`,
        reason: 'already-seeded',
      },
      { status: 409 },
    );
  }

  const inputs = pageCompositionsToPayloadPages(tenantId, pages);
  let seededCount = 0;
  const errors: Array<{ slug: string; error: string }> = [];

  /* tenant 內共用一筆 placeholder Media doc — image asset 第一次出現才上傳，
   * 之後 reuse。避免每張 fixture 都呼叫 payload.create 一次拖慢 seed。 */
  const mediaCache = createPlaceholderMediaCache();

  for (const input of inputs) {
    try {
      const transformedLayout = await Promise.all(
        input.layout.map((block) =>
          transformPayloadBlockForPayload(payload, tenantId, block, mediaCache),
        ),
      );
      /* Payload 產生型別對 block fields 要求嚴格（required headline 等），
       * BlockInstance 不一定全填——這裡信任種子資料由各 block 自己的 Zod schema
       * 攔截錯誤，型別層用 cast 跳過。 */
      await payload.create({
        collection: 'pages',
        data: { ...input, layout: transformedLayout } as Record<string, unknown> as never,
      });
      seededCount += 1;
    } catch (err) {
      errors.push({
        slug: input.slug,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (errors.length > 0) {
    return Response.json(
      {
        ok: false,
        error: `部分頁面建立失敗：${errors.length}/${inputs.length}`,
        reason: 'partial-failure',
        seededCount,
        errors,
      },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, seededCount, tenantId });
}
