import { PRODUCT_TITLE_MAX_LENGTH } from './types.js';

import type { Product, ProductVariant } from './types.js';

/**
 * 驗證商品標題長度（70 字內）。
 */
export function validateProductTitle(title: string): { valid: boolean; reason?: string } {
  if (!title || title.trim().length === 0) {
    return { valid: false, reason: '標題不可為空' };
  }
  if (title.length > PRODUCT_TITLE_MAX_LENGTH) {
    return {
      valid: false,
      reason: `標題過長（${title.length} 字，上限 ${PRODUCT_TITLE_MAX_LENGTH} 字）`,
    };
  }
  return { valid: true };
}

/**
 * 驗證 slug 格式（小寫英數連字號）。
 */
export function validateSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * 計算 variant matrix 的 SKU 數量。
 *
 * @example
 * variantMatrixSize({ color: ['紅', '藍'], size: ['S', 'M', 'L'] }) // 6
 */
export function variantMatrixSize(options: Record<string, string[]>): number {
  const values = Object.values(options);
  if (values.length === 0) return 0;
  return values.reduce((acc, arr) => acc * arr.length, 1);
}

/**
 * 展開 variant matrix 成所有 option combinations。
 */
export function expandVariantMatrix(
  options: Record<string, string[]>,
): Array<Record<string, string>> {
  const keys = Object.keys(options);
  if (keys.length === 0) return [];

  const result: Array<Record<string, string>> = [{}];
  for (const key of keys) {
    const values = options[key];
    if (!values || values.length === 0) continue;
    const next: Array<Record<string, string>> = [];
    for (const combo of result) {
      for (const value of values) {
        next.push({ ...combo, [key]: value });
      }
    }
    result.length = 0;
    result.push(...next);
  }
  return result;
}

/**
 * 檢查商品是否可排程上架（scheduledAt 在未來）。
 */
export function isScheduledForPublish(product: Pick<Product, 'scheduledAt' | 'status'>): boolean {
  if (product.status !== 'draft') return false;
  if (!product.scheduledAt) return false;
  return new Date(product.scheduledAt).getTime() > Date.now();
}

/**
 * 取得 variant 的庫存總和（用於商品列表頁顯示「剩 N 件」）。
 */
export function totalInventory(variants: ProductVariant[]): number {
  return variants.reduce((sum, v) => sum + v.inventory, 0);
}
