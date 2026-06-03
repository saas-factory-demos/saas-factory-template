/**
 * Cart 變動偵測（Phase 14 多商品擴充）。
 *
 * 把 cart line 的 snapshot 與「當前 product variants」比對，標記哪些 line 有變動。
 *
 * 偵測項目：
 * - **價格變動**（unitPriceSnapshot vs current variants[].unitPrice）
 * - **缺貨**（current available < line.quantity）
 * - **變體下架**（variants[] 找不到對應 sku）
 *
 * 給 UI 在 /cart 頁面顯示「您加購的『紅色 M 號』已下架」「價格已更新」這類 alert。
 */
import type { Payload } from 'payload';

interface CartLine {
  product: number | string | { id: number | string };
  variantSku: string;
  quantity: number;
  unitPriceSnapshot: number;
  titleSnapshot?: string;
}

interface ProductWithVariants {
  id: number | string;
  title?: string;
  variants?: Array<{ sku: string; unitPrice: number; stock?: number; reservedStock?: number }>;
}

export type CartLineChangeKind =
  | { kind: 'price-changed'; oldPrice: number; newPrice: number }
  | { kind: 'out-of-stock'; available: number; requested: number }
  | { kind: 'variant-removed'; sku: string };

export interface CartLineChange {
  productId: number | string;
  variantSku: string;
  changes: CartLineChangeKind[];
}

/**
 * 對整 cart 跑變動偵測，回傳每 line 的變動清單（只回有變動的）。
 *
 * 不修改 cart；UI 拿這個結果加紅 / 黃標即可。檢查結果不算「錯誤」，
 * 用戶可以選擇繼續結帳（價格用最新）或調整。
 */
export async function detectCartChanges(
  payload: Payload,
  items: CartLine[],
): Promise<CartLineChange[]> {
  const results: CartLineChange[] = [];
  for (const line of items) {
    const productId = typeof line.product === 'object' ? line.product.id : line.product;
    const product = (await payload.findByID({
      collection: 'products',
      id: productId,
      disableErrors: true,
    })) as unknown as ProductWithVariants | null;
    if (!product) {
      results.push({
        productId,
        variantSku: line.variantSku,
        changes: [{ kind: 'variant-removed', sku: line.variantSku }],
      });
      continue;
    }
    const variant = product.variants?.find((v) => v.sku === line.variantSku);
    if (!variant) {
      results.push({
        productId,
        variantSku: line.variantSku,
        changes: [{ kind: 'variant-removed', sku: line.variantSku }],
      });
      continue;
    }
    const lineChanges: CartLineChangeKind[] = [];
    if (variant.unitPrice !== line.unitPriceSnapshot) {
      lineChanges.push({
        kind: 'price-changed',
        oldPrice: line.unitPriceSnapshot,
        newPrice: variant.unitPrice,
      });
    }
    const available = Math.max(0, (variant.stock ?? 0) - (variant.reservedStock ?? 0));
    if (available < line.quantity) {
      lineChanges.push({
        kind: 'out-of-stock',
        available,
        requested: line.quantity,
      });
    }
    if (lineChanges.length > 0) {
      results.push({
        productId,
        variantSku: line.variantSku,
        changes: lineChanges,
      });
    }
  }
  return results;
}
