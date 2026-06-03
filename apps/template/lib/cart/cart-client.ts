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

export type CartChangeKind =
  | { kind: 'price-changed'; oldPrice: number; newPrice: number }
  | { kind: 'out-of-stock'; available: number; requested: number }
  | { kind: 'variant-removed'; sku: string };

export interface CartChange {
  productId: number | string;
  variantSku: string;
  changes: CartChangeKind[];
}

/** GET /api/cart：拉 cart（沒 cookie 會自動建一個並設 cookie）。 */
export async function loadCart(): Promise<ClientCart> {
  const res = await fetch('/api/cart', { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`load cart failed: ${res.status}`);
  const json = (await res.json()) as { cart: ClientCart };
  return json.cart;
}

/** GET /api/cart + changes：給 cart 頁顯示「價格更新 / 缺貨」alert 用。 */
export async function loadCartWithChanges(): Promise<{
  cart: ClientCart;
  changes: CartChange[];
}> {
  const res = await fetch('/api/cart', { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`load cart failed: ${res.status}`);
  return (await res.json()) as { cart: ClientCart; changes: CartChange[] };
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
