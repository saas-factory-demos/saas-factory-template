import { NoImageReturnedError } from './errors.js';

import type { AspectRatio, ImageGenRequest, ImageGenResult } from './types.js';

/** 把 '16:9' 之類字串轉成數值比例。 */
function parseAspectRatio(ratio: AspectRatio): number {
  const [w, h] = ratio.split(':').map((n) => Number(n));
  if (!w || !h) return 1;
  return w / h;
}

/** 估算 base64 解碼後的 bytes 數（不實際解碼）。 */
export function estimateBytesFromB64(b64: string): number {
  const len = b64.length;
  if (len === 0) return 0;
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((len * 3) / 4) - padding);
}

/**
 * 對單張結果評「長寬比符合度」分數（0~1）。
 *
 * 有 width / height 才能評；缺則回中性 0.5（不獎不罰）。
 * 比例越接近請求的 aspectRatio 分數越高。
 */
export function aspectScore(result: ImageGenResult, target: AspectRatio): number {
  if (!result.width || !result.height) return 0.5;
  const want = parseAspectRatio(target);
  const got = result.width / result.height;
  const diff = Math.abs(got - want) / want;
  return Math.max(0, 1 - diff);
}

/** curator 評分明細（除錯 / 測試用）。 */
export interface ImageScore {
  /** 對應的結果索引。 */
  index: number;
  /** 綜合分數（0~1）。 */
  score: number;
  /** 長寬比符合度。 */
  aspect: number;
  /** 細節度（相對 bytes，0~1）。 */
  detail: number;
}

/**
 * 對一批候選圖評分。
 *
 * 啟發式（無 vision model 的初版）：
 * - aspect（權重 0.6）：長寬比符合請求
 * - detail（權重 0.4）：相對 byte 數（越大假設細節越多），以該批最大值正規化
 *
 * 為何只用啟發式：初版避免再呼叫 vision model（成本翻倍）；後續可在此函式接美學評分。
 *
 * @param results 候選圖
 * @param request 原始請求（取 aspectRatio）
 * @returns 每張的評分明細（順序對應 results）
 */
export function scoreImages(
  results: readonly ImageGenResult[],
  request: ImageGenRequest,
): ImageScore[] {
  const byteSizes = results.map((r) => estimateBytesFromB64(r.b64));
  const maxBytes = Math.max(1, ...byteSizes);
  return results.map((r, index) => {
    const aspect = aspectScore(r, request.aspectRatio);
    const detail = byteSizes[index]! / maxBytes;
    const score = aspect * 0.6 + detail * 0.4;
    return { index, score, aspect, detail };
  });
}

/**
 * best-of-N：從候選圖挑最佳一張。
 *
 * 空陣列 → throw NoImageReturnedError（呼叫端應已先確保 adapter 有回圖）。
 * 平手取索引較小者（穩定）。
 *
 * @param results 候選圖
 * @param request 原始請求
 * @returns 最佳一張
 */
export function pickBestImage(
  results: readonly ImageGenResult[],
  request: ImageGenRequest,
): ImageGenResult {
  if (results.length === 0) {
    throw new NoImageReturnedError('curator', '候選圖為空，無法挑選');
  }
  const scored = scoreImages(results, request);
  let best = scored[0]!;
  for (const s of scored) {
    if (s.score > best.score) best = s;
  }
  return results[best.index]!;
}
