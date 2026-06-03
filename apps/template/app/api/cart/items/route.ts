/**
 * Cart items endpoint（Phase 4 多商品擴充）。
 *
 * POST /api/cart/items
 *   body: { productId, variantSku, quantity }
 *   → addItemToCart（已有同 variant line 會合併 quantity）
 *
 * PATCH /api/cart/items
 *   body: { productId, variantSku, quantity }
 *   → updateCartItemQuantity（quantity=0 = 移除 line）
 *
 * 共用 cart-id 從 cookie 讀。沒 cart-id cookie → 401 提示 client 先 GET /api/cart 建一個。
 */
import { headers as nextHeaders } from 'next/headers';
import { getPayload } from 'payload';

import { addItemToCart, updateCartItemQuantity } from '@/lib/cart/cart-service';
import config from '@/payload.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ItemBody {
  productId?: string | number;
  variantSku?: string;
  quantity?: number;
}

function readCookie(req: Request, key: string): string | null {
  const raw = req.headers.get('cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === key) return rest.join('=');
  }
  return null;
}

async function validateCartAccess(
  req: Request,
): Promise<{ cartId: string; ok: true } | { ok: false; response: Response }> {
  const cartId = readCookie(req, 'cart-id');
  if (!cartId) {
    return {
      ok: false,
      response: Response.json({ error: '先呼 GET /api/cart 建立 cart' }, { status: 401 }),
    };
  }
  return { cartId, ok: true };
}

function parseItemBody(body: ItemBody): { ok: true; parsed: Required<ItemBody> } | { ok: false; response: Response } {
  if (!body.productId || !body.variantSku || typeof body.quantity !== 'number') {
    return {
      ok: false,
      response: Response.json(
        { error: '需 productId / variantSku / quantity' },
        { status: 400 },
      ),
    };
  }
  return { ok: true, parsed: { productId: body.productId, variantSku: body.variantSku, quantity: body.quantity } };
}

export async function POST(req: Request): Promise<Response> {
  const auth = await validateCartAccess(req);
  if (!auth.ok) return auth.response;

  let body: ItemBody;
  try {
    body = (await req.json()) as ItemBody;
  } catch {
    return Response.json({ error: 'JSON body 解析失敗' }, { status: 400 });
  }
  if (body.quantity !== undefined && body.quantity < 1) {
    return Response.json({ error: 'POST quantity 必須 >= 1（移除請用 PATCH quantity=0）' }, { status: 400 });
  }
  const parsed = parseItemBody(body);
  if (!parsed.ok) return parsed.response;

  const payload = await getPayload({ config });
  void (await nextHeaders()); // 觸發 dynamic
  const result = await addItemToCart(payload, {
    cartId: auth.cartId,
    productId: parsed.parsed.productId,
    variantSku: parsed.parsed.variantSku,
    quantity: parsed.parsed.quantity,
  });
  if (!result.ok) {
    return Response.json(
      { ok: false, error: result.error, available: result.available },
      { status: 409 },
    );
  }
  return Response.json({ ok: true, cart: result.cart });
}

export async function PATCH(req: Request): Promise<Response> {
  const auth = await validateCartAccess(req);
  if (!auth.ok) return auth.response;

  let body: ItemBody;
  try {
    body = (await req.json()) as ItemBody;
  } catch {
    return Response.json({ error: 'JSON body 解析失敗' }, { status: 400 });
  }
  const parsed = parseItemBody(body);
  if (!parsed.ok) return parsed.response;
  if (parsed.parsed.quantity < 0) {
    return Response.json({ error: 'quantity 必須 >= 0（移除用 0）' }, { status: 400 });
  }

  const payload = await getPayload({ config });
  void (await nextHeaders());
  const result = await updateCartItemQuantity(payload, {
    cartId: auth.cartId,
    productId: parsed.parsed.productId,
    variantSku: parsed.parsed.variantSku,
    quantity: parsed.parsed.quantity,
  });
  if (!result.ok) {
    return Response.json({ ok: false, error: result.error }, { status: 409 });
  }
  return Response.json({ ok: true, cart: result.cart });
}
