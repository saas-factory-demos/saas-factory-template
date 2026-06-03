import { getImagePriceUsd } from '../budget.js';
import { ImageGenAPIError, NoImageReturnedError } from '../errors.js';

import type { AspectRatio, ImageGenAdapter, ImageGenRequest, ImageGenResult } from '../types.js';

/** OpenAI Images API endpoint。 */
const OPENAI_IMAGES_URL = 'https://api.openai.com/v1/images/generations';

/** 預設 model：gpt-image-2（2026-04-21 OpenAI 最新生圖模型）。env `OPENAI_IMAGE_MODEL` 可覆寫。 */
export const DEFAULT_OPENAI_IMAGE_MODEL = 'gpt-image-2';

/** OpenAI 生圖品質檔。high 質感最佳但成本較高（對應 user「質感很重要」預設 high）。 */
export type OpenAIImageQuality = 'low' | 'medium' | 'high' | 'auto';

/** AspectRatio → OpenAI size（gpt-image 支援 landscape / square / portrait 三檔）。 */
function sizeForAspect(aspect: AspectRatio): { size: string; width: number; height: number } {
  switch (aspect) {
    case '1:1':
      return { size: '1024x1024', width: 1024, height: 1024 };
    case '9:16':
    case '3:4':
      return { size: '1024x1536', width: 1024, height: 1536 };
    default:
      // 16:9 / 4:3 / 3:2 皆走 landscape
      return { size: '1536x1024', width: 1536, height: 1024 };
  }
}

/** 解析 OPENAI_API_KEY：優先用顯式傳入，否則讀 env，皆無則 throw。 */
function resolveApiKey(explicit?: string): string {
  if (explicit && explicit.length > 0) return explicit;
  const fromEnv =
    typeof process !== 'undefined' && process.env ? process.env.OPENAI_API_KEY : undefined;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  throw new Error('OPENAI_API_KEY 未設定：請透過 options.apiKey 或環境變數提供。');
}

/** OpenAI 生圖 adapter 建構選項。 */
export interface OpenAIImageAdapterOptions {
  /** API key（未傳則讀 process.env.OPENAI_API_KEY）。 */
  apiKey?: string;
  /** model id（未傳則讀 OPENAI_IMAGE_MODEL，再 fallback gpt-image-2）。 */
  model?: string;
  /** 品質檔，預設 high。 */
  quality?: OpenAIImageQuality;
  /** 注入 fetch（測試用）。 */
  fetchImpl?: typeof fetch;
}

/** OpenAI Images API 回傳結構（只取 b64）。 */
interface OpenAIImagesResponse {
  data?: Array<{ b64_json?: string; revised_prompt?: string }>;
  error?: { message?: string };
}

/**
 * OpenAI gpt-image-2 生圖 adapter。
 *
 * - 走 Images API（`/v1/images/generations`），回 base64（gpt-image 預設不回 url）
 * - `n` 一次要多張對應 best-of-N；size 依長寬比挑 landscape/square/portrait 三檔
 */
export class OpenAIImageAdapter implements ImageGenAdapter {
  public readonly provider = 'openai' as const;
  public readonly model: string;
  private readonly quality: OpenAIImageQuality;
  private readonly fetchImpl: typeof fetch;
  private readonly apiKey: string;

  public constructor(options: OpenAIImageAdapterOptions = {}) {
    this.apiKey = resolveApiKey(options.apiKey);
    const envModel =
      typeof process !== 'undefined' && process.env ? process.env.OPENAI_IMAGE_MODEL : undefined;
    this.model = options.model ?? (envModel && envModel.length > 0 ? envModel : DEFAULT_OPENAI_IMAGE_MODEL);
    this.quality = options.quality ?? 'high';
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  public estimateCostUsd(request: ImageGenRequest): number {
    return getImagePriceUsd(this.model) * Math.max(1, request.count);
  }

  public async generate(request: ImageGenRequest): Promise<ImageGenResult[]> {
    const { size, width, height } = sizeForAspect(request.aspectRatio);
    const fullPrompt =
      request.styleHints && request.styleHints.length > 0
        ? `${request.prompt} ${request.styleHints.join(' ')}`
        : request.prompt;

    const res = await this.fetchImpl(OPENAI_IMAGES_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt: fullPrompt,
        n: Math.max(1, request.count),
        size,
        quality: this.quality,
      }),
    });

    if (!res.ok) {
      throw new ImageGenAPIError('openai', res.status, await res.text());
    }

    const json = (await res.json()) as OpenAIImagesResponse;
    const items = json.data ?? [];
    const perImageCost = getImagePriceUsd(this.model);
    const results: ImageGenResult[] = [];
    for (const item of items) {
      if (!item.b64_json) continue;
      results.push({
        b64: item.b64_json,
        mimeType: 'image/png',
        model: this.model,
        costUsd: perImageCost,
        width,
        height,
        revisedPrompt: item.revised_prompt,
      });
    }
    if (results.length === 0) {
      throw new NoImageReturnedError('openai', 'data 內無 b64_json');
    }
    return results;
  }
}
