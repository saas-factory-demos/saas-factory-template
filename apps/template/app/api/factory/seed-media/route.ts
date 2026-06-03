import config from '@payload-config';
import { getPayload } from 'payload';

import { verifySeedMediaRequest } from '@/lib/factory-seed-media-verify';

/**
 * Factory → Template seed-media endpoint。
 *
 * 用途：generator `generate-images` step 在工廠端用工廠的生圖 key 產圖後，把圖 bytes
 * 推進客戶站建立 Media doc，回傳 doc id。生圖 key 全程留在工廠端、不注入客戶站 env，
 * 故交付給客戶的站不含任何生圖金鑰（對應 user 2026-05-29「不要 key 被帶走」）。
 *
 * 安全機制（與 seed-pages 同）：
 * 1. FACTORY_BOOTSTRAP_SECRET 未設定 → fail-closed（403）
 * 2. HMAC 簽章（method / path / timestamp / body）+ 5 分鐘時間漂移
 *
 * 為何不檢查 already-seeded：媒體是逐張 ingest、filename 帶 tenant + slot hash 保證唯一，
 * 重跑會因 filename unique 自動去重（Payload 端），這裡不額外擋。
 */
export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const verifyResult = verifySeedMediaRequest({
    secret: process.env.FACTORY_BOOTSTRAP_SECRET,
    method: 'POST',
    path: '/api/factory/seed-media',
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
  const { alt, b64, mimeType, filename } = verifyResult.body;

  try {
    const buf = Buffer.from(b64, 'base64');
    /* Payload Media collection 預設 schema 由模板宣告；alt 是 optional text。
     * 型別層用 cast 跳過：Media data 形狀依各客戶 collection 而異。 */
    const doc = (await payload.create({
      collection: 'media',
      data: { alt: alt.length > 0 ? alt : '生成圖' } as Record<string, unknown> as never,
      file: {
        data: buf,
        mimetype: mimeType,
        name: filename,
        size: buf.length,
      },
    })) as { id: number | string };
    return Response.json({ ok: true, mediaId: doc.id });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err), reason: 'create-failed' },
      { status: 500 },
    );
  }
}
