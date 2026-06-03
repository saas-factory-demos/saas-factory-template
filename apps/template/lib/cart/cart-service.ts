/**
 * Cart Service（Phase 4 多商品擴充）。
 *
 * 包 Payload Local API 提供購物車 CRUD。所有 endpoint 共用同一個 service，
 * 避免邏輯散落各 route handler。
 *
 * 設計重點：
 * - cartId UUID v4 由 server 生（瀏覽器只記，沒生）
 * - guestSessionId 同樣 server 給；登入後 hook 撈出綁 user
 * - inventoryStrategy='limited' 的商品：addItem 立刻 reserveVariant + 寫 reservedUntil
 * - cart 過期判斷不 hard delete，靠 cron job 標 abandoned + release reservedStock
 */
import { randomUUID } from 'node:crypto';

import { reserveVariant, releaseVariant, getAvailable } from './inventory-reserver.js';

import type { Payload } from 'payload';

const TTL_DAYS_NORMAL = 14;
const TTL_MINUTES_LIMITED = 30;

interface CartDoc {
  id: number | string;
  cartId: string;
  tenantId: string;
  user?: number | string | null;
  guestSessionId?: string | null;
  status: 'active' | 'converted' | 'abandoned';
  items?: CartItem[];
  subtotal?: number;
  discountTotal?: number;
  estimatedTotal?: number;
  currency?: string;
  expiresAt?: string;
  lastActivityAt?: string;
  [k: string]: unknown;
}

interface CartItem {
  product: number | string;
  variantSku: string;
  quantity: number;
  optionValuesSnapshot?: Record<string, string>;
  unitPriceSnapshot: number;
  titleSnapshot?: string;
  reservedUntil?: string;
  addedAt?: string;
}

interface ProductDoc {
  id: number | string;
  title?: string;
  inventoryStrategy?: 'normal' | 'limited';
  variants?: Array<{
    sku: string;
    unitPrice: number;
    stock: number;
    reservedStock: number;
    optionValues?: Record<string, string>;
  }>;
  unitPrice?: number;
  currency?: string;
}

/**
 * 找或建 Cart（給訪客 sessionId / 已登入 userId 用）。
 */
export async function loadOrCreateCart(
  payload: Payload,
  input: { tenantId?: string; userId?: string | number; guestSessionId?: string },
): Promise<{ cart: CartDoc; created: boolean }> {
  const tenantId = input.tenantId ?? 'default';

  if (input.userId) {
    const res = await payload.find({
      collection: 'carts',
      where: {
        and: [
          { status: { equals: 'active' } },
          { user: { equals: input.userId } },
        ],
      },
      sort: '-updatedAt',
      limit: 1,
    });
    const existing = res.docs[0] as unknown as CartDoc | undefined;
    if (existing) return { cart: existing, created: false };
  } else if (input.guestSessionId) {
    const res = await payload.find({
      collection: 'carts',
      where: {
        and: [
          { status: { equals: 'active' } },
          { guestSessionId: { equals: input.guestSessionId } },
        ],
      },
      sort: '-updatedAt',
      limit: 1,
    });
    const existing = res.docs[0] as unknown as CartDoc | undefined;
    if (existing) return { cart: existing, created: false };
  }

  // 建新 cart
  const cartId = randomUUID();
  const expiresAt = new Date(Date.now() + TTL_DAYS_NORMAL * 86400_000).toISOString();
  const sessionId = input.guestSessionId ?? randomUUID();
  const created = (await payload.create({
    collection: 'carts',
    data: {
      cartId,
      tenantId,
      user: input.userId,
      guestSessionId: input.userId ? undefined : sessionId,
      status: 'active',
      items: [],
      currency: 'TWD',
      expiresAt,
      lastActivityAt: new Date().toISOString(),
    } as unknown as Record<string, unknown> as never,
    overrideAccess: true,
  })) as unknown as CartDoc;
  return { cart: created, created: true };
}

/**
 * 加入商品到 Cart。
 *
 * 若已有同 product+variant line → quantity += addQty（合併）。
 * limited 庫存 → 加車立刻 reserve。
 */
export async function addItemToCart(
  payload: Payload,
  input: {
    cartId: string;
    productId: number | string;
    variantSku: string;
    quantity: number;
  },
): Promise<{
  ok: boolean;
  cart?: CartDoc;
  error?: string;
  available?: number;
}> {
  const res = await payload.find({
    collection: 'carts',
    where: { cartId: { equals: input.cartId }, status: { equals: 'active' } },
    limit: 1,
  });
  const cart = res.docs[0] as unknown as CartDoc | undefined;
  if (!cart) return { ok: false, error: 'cart not found' };

  const product = (await payload.findByID({
    collection: 'products',
    id: input.productId,
    disableErrors: true,
  })) as unknown as ProductDoc | null;
  if (!product) return { ok: false, error: 'product not found' };

  const variant = product.variants?.find((v) => v.sku === input.variantSku);
  if (!variant && product.variants && product.variants.length > 0) {
    return { ok: false, error: 'variant not found' };
  }
  // 單變體商品（沒 variants）走 product 級 unitPrice
  const unitPrice = variant?.unitPrice ?? product.unitPrice ?? 0;
  if (unitPrice <= 0) return { ok: false, error: 'price not set' };

  // limited 商品立刻 reserve
  if (product.inventoryStrategy === 'limited' && variant) {
    const reserveRes = await reserveVariant(payload, {
      productId: product.id,
      variantSku: input.variantSku,
      quantity: input.quantity,
    });
    if (!reserveRes.ok) {
      return {
        ok: false,
        error: reserveRes.reason ?? 'reserve failed',
        available: reserveRes.available,
      };
    }
  }

  // merge 或 push line
  const items = [...(cart.items ?? [])];
  const existingIdx = items.findIndex(
    (it) => String(it.product) === String(product.id) && it.variantSku === input.variantSku,
  );
  const now = new Date().toISOString();
  const reservedUntil =
    product.inventoryStrategy === 'limited'
      ? new Date(Date.now() + TTL_MINUTES_LIMITED * 60_000).toISOString()
      : undefined;

  if (existingIdx >= 0) {
    items[existingIdx] = {
      ...items[existingIdx]!,
      quantity: items[existingIdx]!.quantity + input.quantity,
      reservedUntil: reservedUntil ?? items[existingIdx]!.reservedUntil,
    };
  } else {
    items.push({
      product: product.id,
      variantSku: input.variantSku,
      quantity: input.quantity,
      optionValuesSnapshot: variant?.optionValues,
      unitPriceSnapshot: unitPrice,
      titleSnapshot: product.title,
      reservedUntil,
      addedAt: now,
    });
  }

  // 更新 cart 金額
  const subtotal = items.reduce((sum, it) => sum + it.unitPriceSnapshot * it.quantity, 0);
  const updated = (await payload.update({
    collection: 'carts',
    id: cart.id,
    data: {
      items,
      subtotal,
      estimatedTotal: subtotal, // discount 由 Phase 6 補
      lastActivityAt: now,
    } as unknown as Record<string, unknown> as never,
    overrideAccess: true,
  })) as unknown as CartDoc;
  return { ok: true, cart: updated };
}

/**
 * 更新 cart line 數量（=0 = 移除）。
 */
export async function updateCartItemQuantity(
  payload: Payload,
  input: { cartId: string; productId: number | string; variantSku: string; quantity: number },
): Promise<{ ok: boolean; cart?: CartDoc; error?: string }> {
  const res = await payload.find({
    collection: 'carts',
    where: { cartId: { equals: input.cartId }, status: { equals: 'active' } },
    limit: 1,
  });
  const cart = res.docs[0] as unknown as CartDoc | undefined;
  if (!cart) return { ok: false, error: 'cart not found' };

  const items = [...(cart.items ?? [])];
  const idx = items.findIndex(
    (it) => String(it.product) === String(input.productId) && it.variantSku === input.variantSku,
  );
  if (idx < 0) return { ok: false, error: 'item not in cart' };

  const oldQty = items[idx]!.quantity;
  const diff = input.quantity - oldQty;
  const product = (await payload.findByID({
    collection: 'products',
    id: input.productId,
    disableErrors: true,
  })) as unknown as ProductDoc | null;

  // limited 庫存：差額再 reserve / release
  if (product?.inventoryStrategy === 'limited' && diff !== 0) {
    if (diff > 0) {
      const r = await reserveVariant(payload, {
        productId: input.productId,
        variantSku: input.variantSku,
        quantity: diff,
      });
      if (!r.ok) {
        return { ok: false, error: r.reason ?? 'reserve failed' };
      }
    } else {
      await releaseVariant(payload, {
        productId: input.productId,
        variantSku: input.variantSku,
        quantity: -diff,
      });
    }
  }

  if (input.quantity <= 0) {
    items.splice(idx, 1);
  } else {
    items[idx] = { ...items[idx]!, quantity: input.quantity };
  }
  const subtotal = items.reduce((sum, it) => sum + it.unitPriceSnapshot * it.quantity, 0);
  const updated = (await payload.update({
    collection: 'carts',
    id: cart.id,
    data: {
      items,
      subtotal,
      estimatedTotal: subtotal,
      lastActivityAt: new Date().toISOString(),
    } as unknown as Record<string, unknown> as never,
    overrideAccess: true,
  })) as unknown as CartDoc;
  return { ok: true, cart: updated };
}

/**
 * 把訪客 cart 綁到登入 user。
 *
 * 邏輯：
 * - 用 sessionId 找 active guest cart → 改 user = ?、清掉 guestSessionId
 * - 同 user 若已有另一個 active cart → merge items 後刪訪客 cart
 *
 * 後續 milestone 改加 merge 衝突 UI（同 variant 數量取大、或讓使用者選）。
 * 目前簡單實作：merge 直接累加。
 */
export async function mergeGuestCartToUser(
  payload: Payload,
  input: { guestSessionId: string; userId: string | number; tenantId?: string },
): Promise<{ ok: boolean; cart?: CartDoc }> {
  const guestRes = await payload.find({
    collection: 'carts',
    where: {
      guestSessionId: { equals: input.guestSessionId },
      status: { equals: 'active' },
    },
    limit: 1,
  });
  const guestCart = guestRes.docs[0] as unknown as CartDoc | undefined;
  if (!guestCart) return { ok: true };

  const userRes = await payload.find({
    collection: 'carts',
    where: { user: { equals: input.userId }, status: { equals: 'active' } },
    limit: 1,
  });
  const userCart = userRes.docs[0] as unknown as CartDoc | undefined;

  if (!userCart) {
    // 沒衝突 → guest cart 直接綁 user
    const updated = (await payload.update({
      collection: 'carts',
      id: guestCart.id,
      data: {
        user: input.userId,
        guestSessionId: null,
        lastActivityAt: new Date().toISOString(),
      } as unknown as Record<string, unknown> as never,
      overrideAccess: true,
    })) as unknown as CartDoc;
    return { ok: true, cart: updated };
  }

  // 兩邊都有 → merge items 到 user cart，guest cart 刪除（不留歷史）
  const mergedItems = [...(userCart.items ?? [])];
  for (const guestItem of guestCart.items ?? []) {
    const existing = mergedItems.findIndex(
      (it) => String(it.product) === String(guestItem.product) && it.variantSku === guestItem.variantSku,
    );
    if (existing >= 0) {
      mergedItems[existing] = {
        ...mergedItems[existing]!,
        quantity: mergedItems[existing]!.quantity + guestItem.quantity,
      };
    } else {
      mergedItems.push(guestItem);
    }
  }
  const subtotal = mergedItems.reduce(
    (sum, it) => sum + it.unitPriceSnapshot * it.quantity,
    0,
  );
  await payload.delete({
    collection: 'carts',
    id: guestCart.id,
    overrideAccess: true,
  });
  const updated = (await payload.update({
    collection: 'carts',
    id: userCart.id,
    data: {
      items: mergedItems,
      subtotal,
      estimatedTotal: subtotal,
      lastActivityAt: new Date().toISOString(),
    } as unknown as Record<string, unknown> as never,
    overrideAccess: true,
  })) as unknown as CartDoc;
  return { ok: true, cart: updated };
}

/** Helper：給 Cart UI 顯示每 item 的 max-stock-available。 */
export function variantAvailable(product: ProductDoc, sku: string): number {
  const v = product.variants?.find((row) => row.sku === sku);
  if (!v) return 0;
  return getAvailable(v);
}
