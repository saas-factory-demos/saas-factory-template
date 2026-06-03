/**
 * Bundle 庫存計算（Phase 14 多商品擴充）。
 *
 * Bundle 商品本身沒 stock，能賣幾組要看「子商品庫存」：
 *
 *   能賣的最大組數 = min( childVariant.available / bundleItem.quantity )
 *
 * 例：相機組合 = 相機 × 1 + 鏡頭 × 1 + 包 × 1
 * - 相機 stock 5、available 4（1 已預扣）
 * - 鏡頭 stock 3、available 3
 * - 包 stock 10、available 10
 * → 能賣 3 組
 *
 * 用於 product 詳情頁顯示「剩 N 組」、cart add 時驗證庫存。
 */
import { getAvailable } from './inventory-reserver.js';

import type { Payload } from 'payload';

interface BundleItemRef {
  product: number | string | { id: number | string };
  variantSku: string;
  quantity: number;
}

interface ChildProduct {
  variants?: Array<{ sku: string; stock?: number; reservedStock?: number }>;
}

/**
 * 計算 bundle 能組成的最大成套數。
 *
 * 若任一子商品的對應 variant 找不到 / 庫存 0，回傳 0（不可賣）。
 */
export async function computeBundleAvailableStock(
  payload: Payload,
  bundleItems: BundleItemRef[],
): Promise<number> {
  if (bundleItems.length === 0) return 0;
  let minSets = Infinity;
  for (const bi of bundleItems) {
    const childId = typeof bi.product === 'object' ? bi.product.id : bi.product;
    const child = (await payload.findByID({
      collection: 'products',
      id: childId,
      disableErrors: true,
    })) as unknown as ChildProduct | null;
    if (!child) return 0;
    const variant = child.variants?.find((v) => v.sku === bi.variantSku);
    if (!variant) return 0;
    // VariantRow 要求 stock / reservedStock 為 number；用 0 補齊未定義欄位
    const avail = getAvailable({
      sku: variant.sku,
      stock: variant.stock ?? 0,
      reservedStock: variant.reservedStock ?? 0,
    });
    const setsFromThisChild = Math.floor(avail / bi.quantity);
    if (setsFromThisChild < minSets) minSets = setsFromThisChild;
    if (minSets === 0) return 0;
  }
  return minSets === Infinity ? 0 : minSets;
}
