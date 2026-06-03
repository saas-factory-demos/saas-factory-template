/**
 * Cart load / create endpoint（Phase 4 多商品擴充）。
 *
 * GET /api/cart
 * → 從 cookie 讀 cartId / guestSessionId、或 Payload session → loadOrCreateCart
 * → 設 cookie cart-id（HttpOnly Lax 14 天） + cart-session（同上）
 * → 回 { cart }
 *
 * 為何 cart-id 與 cart-session 兩個 cookie：
 * - cart-id 給「找 cart」用（即使 user 登出也保留 reference）
 * - cart-session 給「身分驗證」用（防止知道 cartId 就能 PUT 別人 cart）
 *
 * POST 也接：用戶在登入頁送 merge 請求時呼這支 + 帶 sessionId，server 端 merge。
 */
import { headers as nextHeaders } from 'next/headers';
import { getPayload } from 'payload';

import { detectCartChanges } from '@/lib/cart/cart-changes';
import { loadOrCreateCart, mergeGuestCartToUser } from '@/lib/cart/cart-service';
import { quoteCheckoutFromCart } from '@/lib/cart/checkout-from-cart';
import config from '@/payload.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function readCookie(req: Request, key: string): string | null {
  const raw = req.headers.get('cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === key) return rest.join('=');
  }
  return null;
}

function buildCookie(name: string, value: string, days: number, isHttps: boolean): string {
  return [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${days * 86400}`,
    isHttps ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export async function GET(req: Request): Promise<Response> {
  const payload = await getPayload({ config });
  const h = await nextHeaders();
  const auth = await payload.auth({ headers: h });

  const existingCartId = readCookie(req, 'cart-id');
  const existingSessionId = readCookie(req, 'cart-session');

  // 已登入 + 之前是訪客 → merge
  if (auth.user && existingSessionId) {
    await mergeGuestCartToUser(payload, {
      guestSessionId: existingSessionId,
      userId: auth.user.id,
    }).catch((err) => {
      console.warn('[cart] merge failed:', err instanceof Error ? err.message : String(err));
    });
  }

  const { cart, created } = await loadOrCreateCart(payload, {
    userId: auth.user?.id,
    guestSessionId: !auth.user ? existingSessionId ?? undefined : undefined,
  });

  // Phase 12：load 同時 re-quote 折扣 + 寫 snapshot；客戶端可直接讀
  // cart.appliedDiscounts / discountTotal / estimatedTotal。
  // 新建 cart（無 items）不算，避免空 quote。
  let changes: Awaited<ReturnType<typeof detectCartChanges>> = [];
  if (!created && (cart.items?.length ?? 0) > 0) {
    await quoteCheckoutFromCart(
      payload,
      cart as unknown as Parameters<typeof quoteCheckoutFromCart>[1],
      { persistSnapshot: true },
    ).catch((err) => {
      console.warn(
        '[cart] discount snapshot persist failed:',
        err instanceof Error ? err.message : String(err),
      );
    });
    // Phase 14：偵測價格 / 庫存 / 變體下架變動，回應給 UI 顯示 alert
    changes = await detectCartChanges(
      payload,
      cart.items as unknown as Parameters<typeof detectCartChanges>[1],
    ).catch(() => []);
  }

  const isHttps = new URL(req.url).protocol === 'https:';
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (created || !existingCartId) {
    const cookies: string[] = [buildCookie('cart-id', cart.cartId, 14, isHttps)];
    if (!auth.user && cart.guestSessionId) {
      cookies.push(buildCookie('cart-session', cart.guestSessionId, 14, isHttps));
    }
    // Multi Set-Cookie：用 array（fetch 規範允許 Set-Cookie 多次）；
    // Next.js 在 Response 內用 headers 物件處理多次 Set-Cookie 要用 append
    return new Response(JSON.stringify({ cart, changes }), {
      status: 200,
      headers: { ...headers, 'set-cookie': cookies.join(', ') },
    });
  }
  return Response.json({ cart, changes });
}
