import { getImagePriceUsd } from '../budget.js';

import type { AspectRatio, ImageGenAdapter, ImageGenRequest, ImageGenResult } from '../types.js';

/** 1×1 透明 PNG（base64，不含前綴）。mock 以它為基底重複堆出不同大小。 */
const BASE_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/** 依長寬比給一組基準像素尺寸（mock 用，讓 curator aspectScore 完美命中）。 */
const ASPECT_DIMS: Readonly<Record<AspectRatio, { width: number; height: number }>> = Object.freeze({
  '16:9': { width: 1600, height: 900 },
  '4:3': { width: 1200, height: 900 },
  '3:2': { width: 1500, height: 1000 },
  '1:1': { width: 1024, height: 1024 },
  '9:16': { width: 900, height: 1600 },
  '3:4': { width: 900, height: 1200 },
});

/**
 * Mock 生圖 adapter —— 離線確定性，不呼叫外部 API、零成本。
 *
 * 用途：測試 / dry-run / demo（沒設 provider key 時 generator step 用它跑通流程）。
 * 行為：回 `count` 張「同基底但 byte 數遞增」的 PNG，width/height 對齊請求長寬比，
 * 讓 curator 的 aspect / detail 評分有可重現的差異（最後一張 byte 最多 → 最高分）。
 */
export class MockImageGenAdapter implements ImageGenAdapter {
  public readonly provider = 'mock' as const;
  public readonly model: string;

  public constructor(model = 'mock') {
    this.model = model;
  }

  public estimateCostUsd(request: ImageGenRequest): number {
    return getImagePriceUsd(this.model) * Math.max(1, request.count);
  }

  public generate(request: ImageGenRequest): Promise<ImageGenResult[]> {
    const dims = ASPECT_DIMS[request.aspectRatio];
    const n = Math.max(1, request.count);
    const results: ImageGenResult[] = [];
    for (let i = 0; i < n; i += 1) {
      // byte 數隨 index 遞增：重複基底字串 (i+1) 次
      const b64 = BASE_PNG_B64.repeat(i + 1);
      results.push({
        b64,
        mimeType: 'image/png',
        model: this.model,
        costUsd: 0,
        width: dims.width,
        height: dims.height,
        seed: i,
        revisedPrompt: request.prompt,
      });
    }
    return Promise.resolve(results);
  }
}
