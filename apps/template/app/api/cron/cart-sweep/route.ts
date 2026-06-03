/**
 * GET /api/cron/cart-sweep（Phase 11 多商品擴充）。
 *
 * 兩個 sweep：
 *
 * 1. **Abandoned cart sweep**：active cart 過 expiresAt → status='abandoned'
 *    - 保留 cart 資料 60 天供 marketing 再行銷（不立刻 DELETE）
 *    - 同時釋放所有 line 的 reservedStock（避免囤車鎖庫存）
 *
 * 2. **Limited 庫存 sweep**：item.reservedUntil 過期 → 從 cart 移除該 line
 *    並 release variant.reservedStock
 *    - 用於 limited 商品搶購：用戶加車後 30min 不結帳就釋出給其他人
 *    - 不刪整 cart，只移該 line（其他 normal 商品不受影響）
 *
 * 鑑權：CRON_SECRET Bearer（同 workflow-tick）；fail-closed。
 *
 * 建議 Vercel cron 設「每 15 分鐘」一次（限量商品 reservedUntil 是
 * 30min，跑 15 min 一次保證 < 1 cycle 釋出）。
 */
import { getPayload } from 'payload';

import { releaseVariant } from '@/lib/cart/inventory-reserver';
import config from '@/payload.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface CartItem {
  product: number | string | { id: number | string };
  variantSku: string;
  quantity: number;
  reservedUntil?: string;
}

interface CartDoc {
  id: number | string;
  status: string;
  expiresAt?: string;
  items?: CartItem[];
}

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET ?? '';
  if (!secret) {
    return Response.json(
      { ok: false, error: 'CRON_SECRET 未設定（fail-closed）' },
      { status: 503 },
    );
  }
  const auth = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  if (!match || match[1] !== secret) {
    return Response.json({ ok: false, error: 'cron 鑑權失敗' }, { status: 401 });
  }

  const payload = await getPayload({ config });
  const now = new Date();
  const stats = {
    abandonedMarked: 0,
    reservedStockReleased: 0,
    expiredLinesRemoved: 0,
    errors: 0,
  };

  // ── Sweep 1：active cart 過 expiresAt → 標 abandoned + release 所有 reserved
  const expiredRes = await payload.find({
    collection: 'carts',
    where: {
      and: [
        { status: { equals: 'active' } },
        { expiresAt: { less_than: now.toISOString() } },
      ],
    },
    limit: 200,
  });
  for (const cart of expiredRes.docs) {
    const c = cart as unknown as CartDoc;
    try {
      // 釋放所有 reserved 庫存
      for (const item of c.items ?? []) {
        const productId = typeof item.product === 'object' ? item.product.id : item.product;
        if (item.reservedUntil) {
          // limited 商品有 reservedUntil → 釋放
          await releaseVariant(payload, {
            productId,
            variantSku: item.variantSku,
            quantity: item.quantity,
          });
          stats.reservedStockReleased += 1;
        }
      }
      await payload.update({
        collection: 'carts',
        id: c.id,
        data: { status: 'abandoned' } as unknown as Record<string, unknown> as never,
        overrideAccess: true,
      });
      stats.abandonedMarked += 1;
    } catch (err) {
      console.warn('[cart-sweep] abandoned mark failed for', c.id, err);
      stats.errors += 1;
    }
  }

  // ── Sweep 2：active cart 內 reservedUntil 過期的個別 line → 移除 + release
  // 範圍：只看 active cart（abandoned 已在 Sweep 1 處理）
  // 為了減少回讀全表，這支 query 撈 200 個 active cart 逐個檢查（簡單實作）；
  // 高流量時可改為 SQL「where items.reservedUntil < now」直查（需 Payload raw query）。
  const activeRes = await payload.find({
    collection: 'carts',
    where: { status: { equals: 'active' } },
    limit: 200,
  });
  for (const cart of activeRes.docs) {
    const c = cart as unknown as CartDoc;
    const items = c.items ?? [];
    const expiredItems = items.filter(
      (it) => it.reservedUntil && new Date(it.reservedUntil) < now,
    );
    if (expiredItems.length === 0) continue;

    try {
      // 釋放每個過期 line 的 reservedStock
      for (const item of expiredItems) {
        const productId = typeof item.product === 'object' ? item.product.id : item.product;
        await releaseVariant(payload, {
          productId,
          variantSku: item.variantSku,
          quantity: item.quantity,
        });
        stats.reservedStockReleased += 1;
        stats.expiredLinesRemoved += 1;
      }
      // 更新 cart 移除過期 lines
      const remainingItems = items.filter(
        (it) => !it.reservedUntil || new Date(it.reservedUntil) >= now,
      );
      const subtotal = remainingItems.reduce(
        (sum, it) => sum + ((it as unknown as { unitPriceSnapshot?: number }).unitPriceSnapshot ?? 0) * it.quantity,
        0,
      );
      await payload.update({
        collection: 'carts',
        id: c.id,
        data: {
          items: remainingItems,
          subtotal,
          estimatedTotal: subtotal,
          lastActivityAt: now.toISOString(),
        } as unknown as Record<string, unknown> as never,
        overrideAccess: true,
      });
    } catch (err) {
      console.warn('[cart-sweep] expired-line sweep failed for', c.id, err);
      stats.errors += 1;
    }
  }

  return Response.json({ ok: true, stats });
}
