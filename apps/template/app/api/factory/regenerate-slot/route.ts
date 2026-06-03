import config from '@payload-config';
import { getPayload } from 'payload';

import { verifyRegenerateSlotRequest } from '@/lib/factory-regenerate-slot-verify';

/**
 * Factory → Template regenerate-slot endpoint。
 *
 * goal-12 新策略（user 2026-05-30）：初次生站每位置只生 1 張；事後 owner 對某張不滿意，
 * 工廠端用工廠的 OpenAI key 重生一張，呼叫此端點把 bytes 寫成新 Media doc 並把對應頁面
 * block 內的 image 欄位指向新 mediaId。生圖 key 不隨站交付。
 *
 * 流程：
 * 1. HMAC verify（共用 FACTORY_BOOTSTRAP_SECRET，與 seed-pages / seed-media 同安全層）
 * 2. payload.create media（上傳 bytes 進 R2，回新 mediaId）
 * 3. payload.find pages where slug + tenantId → 取得既有 layout
 * 4. 深拷貝後依 `path` 走進對應 block，把最末 key 改寫為新 mediaId
 * 5. payload.update 寫回 layout，回傳新 mediaId + 舊值（給 audit / 日後刪舊 media 用）
 *
 * 為何不順手刪舊 Media doc：避免被其他頁面 / 區塊引用時連帶破圖；舊圖留著由 owner 手動清理。
 */
export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const verifyResult = verifyRegenerateSlotRequest({
    secret: process.env.FACTORY_BOOTSTRAP_SECRET,
    method: 'POST',
    path: '/api/factory/regenerate-slot',
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
  const { tenantId, pageSlug, blockId, path, alt, b64, mimeType, filename } = verifyResult.body;

  try {
    // 1. 建新 Media doc（上傳走 R2 s3 plugin）
    const buf = Buffer.from(b64, 'base64');
    /* Payload Media schema 由模板定義；cast 同 seed-media 路徑。 */
    const newMedia = (await payload.create({
      collection: 'media',
      data: { alt: alt.length > 0 ? alt : '重生圖' } as Record<string, unknown> as never,
      file: { data: buf, mimetype: mimeType, name: filename, size: buf.length },
    })) as { id: number | string };

    // 2. 找頁面
    const pageRes = await payload.find({
      collection: 'pages',
      where: { slug: { equals: pageSlug }, tenantId: { equals: tenantId } },
      limit: 1,
      depth: 0,
    });
    const page = pageRes.docs[0];
    if (!page) {
      return Response.json(
        { ok: false, error: `找不到 page slug=${pageSlug} tenant=${tenantId}`, reason: 'page-not-found' },
        { status: 404 },
      );
    }

    // 3. 深拷貝 layout，依 path 把目標位置改成新 mediaId
    const pageWithLayout = page as unknown as { id: number | string; layout?: unknown[] };
    const layout = JSON.parse(JSON.stringify(pageWithLayout.layout ?? [])) as Array<Record<string, unknown>>;
    const blockIdx = layout.findIndex((b) => b.id === blockId);
    if (blockIdx === -1) {
      return Response.json(
        { ok: false, error: `block id=${blockId} 不在 layout`, reason: 'block-not-found' },
        { status: 400 },
      );
    }
    const block = layout[blockIdx]!;
    let node: unknown = block;
    for (let i = 0; i < path.length - 1; i += 1) {
      if (node === null || typeof node !== 'object') {
        return Response.json(
          { ok: false, error: `path[${i}]=${String(path[i])} 走訪失敗`, reason: 'path-invalid' },
          { status: 400 },
        );
      }
      node = (node as Record<string | number, unknown>)[path[i]!];
    }
    if (node === null || typeof node !== 'object') {
      return Response.json(
        { ok: false, error: `path 末端 parent 非物件`, reason: 'path-invalid' },
        { status: 400 },
      );
    }
    const lastKey = path[path.length - 1]!;
    const oldValue = (node as Record<string | number, unknown>)[lastKey];
    (node as Record<string | number, unknown>)[lastKey] = newMedia.id;

    // 4. 寫回頁面
    await payload.update({
      collection: 'pages',
      id: pageWithLayout.id,
      data: { layout } as Record<string, unknown> as never,
    });

    return Response.json({ ok: true, newMediaId: newMedia.id, oldValue });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err), reason: 'regenerate-failed' },
      { status: 500 },
    );
  }
}
