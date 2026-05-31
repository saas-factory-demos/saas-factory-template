import { getImagePriceUsd } from '../budget.js';
import { ImageGenAPIError, NoImageReturnedError } from '../errors.js';

import type { ImageGenAdapter, ImageGenRequest, ImageGenResult } from '../types.js';

/** Gemini generateContent API base。 */
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * 預設 model：gemini-3.1-flash-image-preview（俗稱 Nano Banana 2，2026-02-26）。
 * env `GEMINI_IMAGE_MODEL` 可覆寫（未來版本只需改 env）。
 */
export const DEFAULT_GEMINI_IMAGE_MODEL = 'gemini-3.1-flash-image-preview';

/** 解析 Gemini API key：GEMINI_API_KEY 優先，fallback GOOGLE_AI_API_KEY。 */
function resolveApiKey(explicit?: string): string {
  if (explicit && explicit.length > 0) return explicit;
  const env = typeof process !== 'undefined' ? process.env : undefined;
  const fromEnv = env?.GEMINI_API_KEY ?? env?.GOOGLE_AI_API_KEY;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  throw new Error('GEMINI_API_KEY 未設定：請透過 options.apiKey 或環境變數提供。');
}

/** Gemini 生圖 adapter 建構選項。 */
export interface GeminiImageAdapterOptions {
  /** API key（未傳則讀 GEMINI_API_KEY / GOOGLE_AI_API_KEY）。 */
  apiKey?: string;
  /** model id（未傳則讀 GEMINI_IMAGE_MODEL，再 fallback nano-banana-2）。 */
  model?: string;
  /** 注入 fetch（測試用）。 */
  fetchImpl?: typeof fetch;
}

/** Gemini generateContent 回傳結構（只取 inlineData 圖片）。 */
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ inlineData?: { mimeType?: string; data?: string }; text?: string }>;
    };
  }>;
  error?: { message?: string };
}

/**
 * Google Gemini 3.1 Flash Image（Nano Banana 2）生圖 adapter。
 *
 * 重點：
 * - 走 `:generateContent`，`responseModalities` 必須同時含 `TEXT` + `IMAGE`
 *  （Gemini 影像模型是多模態，只給 IMAGE 會 400）
 * - 單次呼叫回 1 張；best-of-N 以並發 N 次達成
 * - aspectRatio 直接帶進 `imageConfig`（Nano Banana 支援 16:9 / 4:3 / 1:1 等）
 */
export class GeminiImageAdapter implements ImageGenAdapter {
  public readonly provider = 'gemini' as const;
  public readonly model: string;
  private readonly fetchImpl: typeof fetch;
  private readonly apiKey: string;

  public constructor(options: GeminiImageAdapterOptions = {}) {
    this.apiKey = resolveApiKey(options.apiKey);
    const envModel =
      typeof process !== 'undefined' && process.env ? process.env.GEMINI_IMAGE_MODEL : undefined;
    this.model = options.model ?? (envModel && envModel.length > 0 ? envModel : DEFAULT_GEMINI_IMAGE_MODEL);
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  public estimateCostUsd(request: ImageGenRequest): number {
    return getImagePriceUsd(this.model) * Math.max(1, request.count);
  }

  /** 單次生 1 張。 */
  private async generateOne(request: ImageGenRequest): Promise<ImageGenResult | null> {
    const fullPrompt =
      request.styleHints && request.styleHints.length > 0
        ? `${request.prompt} ${request.styleHints.join(' ')}`
        : request.prompt;

    const url = `${GEMINI_API_BASE}/${encodeURIComponent(this.model)}:generateContent`;
    const res = await this.fetchImpl(url, {
      method: 'POST',
      headers: {
        'x-goog-api-key': this.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: { aspectRatio: request.aspectRatio },
        },
      }),
    });

    if (!res.ok) {
      throw new ImageGenAPIError('gemini', res.status, await res.text());
    }

    const json = (await res.json()) as GeminiResponse;
    const parts = json.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);
    if (!imagePart?.inlineData?.data) return null;
    return {
      b64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType ?? 'image/png',
      model: this.model,
      costUsd: getImagePriceUsd(this.model),
    };
  }

  public async generate(request: ImageGenRequest): Promise<ImageGenResult[]> {
    const n = Math.max(1, request.count);
    const settled = await Promise.all(
      Array.from({ length: n }, () => this.generateOne({ ...request, count: 1 })),
    );
    const results = settled.filter((r): r is ImageGenResult => r !== null);
    if (results.length === 0) {
      throw new NoImageReturnedError('gemini', 'candidates 內無 inlineData 圖片');
    }
    return results;
  }
}
