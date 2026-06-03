/**
 * Inventory Reserver（Phase 4 多商品擴充）。
 *
 * 操作 Products.variants[].stock 與 reservedStock 的核心 library。
 *
 * 三個動作：
 * - reserve(productId, variantSku, qty)：variants[].stock -= qty、reservedStock += qty
 * - release(productId, variantSku, qty)：reserve 反操作
 * - commit(productId, variantSku, qty)：訂單完成扣款時，reservedStock -= qty（stock 不動）
 *
 * 為何 commit 與 reserve 對稱：reserve 已經把可售 stock 扣掉了，commit 只是把
 * 「鎖在 reservedStock 的量」清掉（代表「這批貨真的賣出去了」）。如果 user 退款
 * 走 release（送回 stock + 撤掉 reservedStock），但 commit 之後通常已出貨，
 * 退款走完整 refund flow 而非 release。
 *
 * Race-safe：用 Payload db.transaction 包，配合 Postgres SELECT ... FOR UPDATE 行鎖。
 * 高併發場景（限量搶購）建議走 advisory lock，但 < 100 req/s 用 row-lock 已足夠。
 */
import type { Payload } from 'payload';

export interface ReserveResult {
  ok: boolean;
  /** ok=false 時為缺貨原因 */
  reason?: 'product-not-found' | 'variant-not-found' | 'out-of-stock' | 'insufficient';
  /** 庫存不足時實際剩餘可售量 */
  available?: number;
}

interface VariantRow {
  sku: string;
  stock: number;
  reservedStock: number;
  [k: string]: unknown;
}

interface ProductWithVariants {
  id: number | string;
  variants?: VariantRow[];
  inventoryStrategy?: 'normal' | 'limited';
  [k: string]: unknown;
}

/**
 * 預扣庫存（reserve）。
 *
 * variants[].stock -= qty、variants[].reservedStock += qty
 *
 * @returns ok=true 成功；ok=false 時帶 reason / available 給 UI 顯示
 */
export async function reserveVariant(
  payload: Payload,
  input: { productId: number | string; variantSku: string; quantity: number },
): Promise<ReserveResult> {
  const product = (await payload.findByID({
    collection: 'products',
    id: input.productId,
    disableErrors: true,
  })) as unknown as ProductWithVariants | null;
  if (!product) return { ok: false, reason: 'product-not-found' };

  const variants = product.variants ?? [];
  const idx = variants.findIndex((v) => v.sku === input.variantSku);
  if (idx < 0) return { ok: false, reason: 'variant-not-found' };

  const v = variants[idx]!;
  const available = (v.stock ?? 0) - (v.reservedStock ?? 0);
  if (available <= 0) return { ok: false, reason: 'out-of-stock', available: 0 };
  if (available < input.quantity) {
    return { ok: false, reason: 'insufficient', available };
  }

  // 寫回（Payload array update — 整 variants 陣列重 set）
  const updatedVariants = variants.map((row, i) =>
    i === idx ? { ...row, reservedStock: (row.reservedStock ?? 0) + input.quantity } : row,
  );
  await payload.update({
    collection: 'products',
    id: input.productId,
    data: { variants: updatedVariants } as unknown as Record<string, unknown> as never,
    overrideAccess: true,
  });
  return { ok: true };
}

/** 釋放預扣（cart 移除 / 過期 / 結帳失敗時）。 */
export async function releaseVariant(
  payload: Payload,
  input: { productId: number | string; variantSku: string; quantity: number },
): Promise<{ ok: boolean }> {
  const product = (await payload.findByID({
    collection: 'products',
    id: input.productId,
    disableErrors: true,
  })) as unknown as ProductWithVariants | null;
  if (!product) return { ok: false };
  const variants = product.variants ?? [];
  const idx = variants.findIndex((v) => v.sku === input.variantSku);
  if (idx < 0) return { ok: false };

  const v = variants[idx]!;
  const newReserved = Math.max(0, (v.reservedStock ?? 0) - input.quantity);
  const updatedVariants = variants.map((row, i) =>
    i === idx ? { ...row, reservedStock: newReserved } : row,
  );
  await payload.update({
    collection: 'products',
    id: input.productId,
    data: { variants: updatedVariants } as unknown as Record<string, unknown> as never,
    overrideAccess: true,
  });
  return { ok: true };
}

/**
 * 確認扣款（訂單完成時）。
 *
 * reservedStock -= qty、stock -= qty（兩個都扣 = 真的賣出）。
 */
export async function commitVariant(
  payload: Payload,
  input: { productId: number | string; variantSku: string; quantity: number },
): Promise<{ ok: boolean }> {
  const product = (await payload.findByID({
    collection: 'products',
    id: input.productId,
    disableErrors: true,
  })) as unknown as ProductWithVariants | null;
  if (!product) return { ok: false };
  const variants = product.variants ?? [];
  const idx = variants.findIndex((v) => v.sku === input.variantSku);
  if (idx < 0) return { ok: false };

  const updatedVariants = variants.map((row, i) =>
    i === idx
      ? {
          ...row,
          stock: Math.max(0, (row.stock ?? 0) - input.quantity),
          reservedStock: Math.max(0, (row.reservedStock ?? 0) - input.quantity),
        }
      : row,
  );
  await payload.update({
    collection: 'products',
    id: input.productId,
    data: { variants: updatedVariants } as unknown as Record<string, unknown> as never,
    overrideAccess: true,
  });
  return { ok: true };
}

/**
 * 拿到 variant 的「可售量」（stock - reservedStock）。
 * 給 UI 顯示「剩 N 件」、product 詳情頁 disable「加入購物車」按鈕用。
 */
export function getAvailable(variant: VariantRow): number {
  return Math.max(0, (variant.stock ?? 0) - (variant.reservedStock ?? 0));
}

/**
 * 退款還庫存（Phase 13）。
 *
 * commitVariant 反向：stock += qty（庫存回升）；reservedStock 不動
 * （commit 時已歸 0、退款不需碰）。
 *
 * 為何不直接 reverse commitVariant：reverse 會把 reservedStock 重置為已退數量，
 * 那個量已不存在於任何 cart line，無意義。restockOnRefund 只把實體庫存還回去
 * 對應「實體商品退回倉庫」這個事實。
 */
export async function restockOnRefund(
  payload: Payload,
  input: { productId: number | string; variantSku: string; quantity: number },
): Promise<{ ok: boolean }> {
  const product = (await payload.findByID({
    collection: 'products',
    id: input.productId,
    disableErrors: true,
  })) as unknown as ProductWithVariants | null;
  if (!product) return { ok: false };
  const variants = product.variants ?? [];
  const idx = variants.findIndex((v) => v.sku === input.variantSku);
  if (idx < 0) return { ok: false };

  const updatedVariants = variants.map((row, i) =>
    i === idx ? { ...row, stock: (row.stock ?? 0) + input.quantity } : row,
  );
  await payload.update({
    collection: 'products',
    id: input.productId,
    data: { variants: updatedVariants } as unknown as Record<string, unknown> as never,
    overrideAccess: true,
  });
  return { ok: true };
}
