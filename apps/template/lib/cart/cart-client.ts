/**
 * Cart client-side helpers（Phase 5 多商品擴充）。
 *
 * 三個純 fetch wrapper，給 client component 用。所有 endpoint 自動帶 cookie。
 */

export interface ClientCartItem {
  product: number | string;
  variantSku: string;
  quantity: number;
  unitPriceSnapshot: number;
  titleSnapshot?: string;
  optionValuesSnapshot?: Record<string, string>;
}

export interface ClientCart {
  cartId: string;
  status: 'active' | 'converted' | 'abandoned';
  items?: ClientCartItem[];
  subtotal?: number;
  estimatedTotal?: number;
  currency?: string;
}

/** GET /api/cart：拉 cart（沒 cookie 會自動建一個並設 cookie）。 */
export async function loadCart(): Promise<ClientCart> {
  const res = await fetch('/api/cart', { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`load cart failed: ${res.status}`);
  const json = (await res.json()) as { cart: ClientCart };
  return json.cart;
}

/** POST /api/cart/items：加入商品。 */
export async function addItem(input: {
  productId: number | string;
  variantSku: string;
  quantity: number;
}): Promise<{
  ok: boolean;
  cart?: ClientCart;
  error?: string;
  available?: number;
}> {
  const res = await fetch('/api/cart/items', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  return (await res.json()) as {
    ok: boolean;
    cart?: ClientCart;
    error?: string;
    available?: number;
  };
}

/** PATCH /api/cart/items：改數量（0 = 移除）。 */
export async function updateItem(input: {
  productId: number | string;
  variantSku: string;
  quantity: number;
}): Promise<{ ok: boolean; cart?: ClientCart; error?: string }> {
  const res = await fetch('/api/cart/items', {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  return (await res.json()) as { ok: boolean; cart?: ClientCart; error?: string };
}
