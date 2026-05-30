import { pickBestImage } from './curator.js';

import type { ImageBudgetTracker } from './budget.js';
import type { ImageGenAdapter, ImageGenRequest, ImageGenResult } from './types.js';

/** generateBestImage 選項。 */
export interface GenerateBestImageOptions {
  /** 預算守門（可選；傳入則呼叫前估算、呼叫後累計，超支 throw）。 */
  budget?: ImageBudgetTracker;
}

/** generateBestImage 結果。 */
export interface GenerateBestImageResult {
  /** curator 選出的最佳一張。 */
  best: ImageGenResult;
  /** 全部候選（除錯 / 之後想保留多張用）。 */
  candidates: ImageGenResult[];
  /** 本次實際累計成本（USD）。 */
  totalCostUsd: number;
}

/**
 * best-of-N 生圖：估算預算 → 生 N 張 → curator 挑最佳。
 *
 * 流程：
 * 1. 有 budget → 呼叫前 `assertWithinBudget(adapter.estimateCostUsd)`（超支直接 throw，不浪費 API）
 * 2. `adapter.generate(request)` 生 `request.count` 張
 * 3. 有 budget → `recordActual` 累計實際成本
 * 4. `pickBestImage` 挑最佳回傳
 *
 * @param adapter 生圖 adapter
 * @param request 生圖請求（含 count = N）
 * @param options 預算守門
 * @returns 最佳一張 + 全部候選 + 成本
 */
export async function generateBestImage(
  adapter: ImageGenAdapter,
  request: ImageGenRequest,
  options: GenerateBestImageOptions = {},
): Promise<GenerateBestImageResult> {
  const { budget } = options;
  if (budget) {
    budget.assertWithinBudget(adapter.estimateCostUsd(request));
  }

  const candidates = await adapter.generate(request);
  const totalCostUsd = candidates.reduce((sum, c) => sum + (c.costUsd || 0), 0);
  if (budget) {
    budget.recordActual(totalCostUsd);
  }

  const best = pickBestImage(candidates, request);
  return { best, candidates, totalCostUsd };
}
