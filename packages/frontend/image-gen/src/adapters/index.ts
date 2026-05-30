import { GeminiImageAdapter } from './gemini.js';
import { MockImageGenAdapter } from './mock.js';
import { OpenAIImageAdapter, type OpenAIImageQuality } from './openai.js';

import type { ImageGenAdapter, ImageProvider } from '../types.js';

export { MockImageGenAdapter } from './mock.js';
export { OpenAIImageAdapter, DEFAULT_OPENAI_IMAGE_MODEL } from './openai.js';
export type { OpenAIImageAdapterOptions, OpenAIImageQuality } from './openai.js';
export { GeminiImageAdapter, DEFAULT_GEMINI_IMAGE_MODEL } from './gemini.js';
export type { GeminiImageAdapterOptions } from './gemini.js';

/** createImageGenAdapter 選項。 */
export interface CreateAdapterOptions {
  /** 指定 provider；未傳則讀 env `IMAGE_GEN_PROVIDER`。 */
  provider?: ImageProvider;
  /** 顯式 API key（未傳則各 adapter 自讀對應 env）。 */
  apiKey?: string;
  /** 顯式 model id（未傳則各 adapter 自讀對應 env / 預設）。 */
  model?: string;
  /** OpenAI 品質檔（low / medium / high / auto），僅 OpenAI adapter 用；其餘 provider 忽略。 */
  quality?: OpenAIImageQuality;
  /** 注入 fetch（測試用）。 */
  fetchImpl?: typeof fetch;
}

/**
 * 依 provider（或 env `IMAGE_GEN_PROVIDER`）建對應 adapter。
 *
 * 為何用 factory：generator / 後台只認 `ImageGenAdapter` 介面，靠這支依 env 切 provider，
 * 對應 goal-12「不被綁住」——換 provider 只改一個 env，不動呼叫端。
 *
 * 未設且未傳 provider → 預設 `mock`（離線零成本，dry-run / demo 不阻塞）。
 *
 * @param options provider / key / model / fetch 覆寫
 * @returns 對應的生圖 adapter
 */
export function createImageGenAdapter(options: CreateAdapterOptions = {}): ImageGenAdapter {
  const envProvider =
    typeof process !== 'undefined' && process.env
      ? (process.env.IMAGE_GEN_PROVIDER as ImageProvider | undefined)
      : undefined;
  const provider = options.provider ?? envProvider ?? 'mock';

  switch (provider) {
    case 'openai':
      return new OpenAIImageAdapter({
        apiKey: options.apiKey,
        model: options.model,
        quality: options.quality,
        fetchImpl: options.fetchImpl,
      });
    case 'gemini':
      return new GeminiImageAdapter({
        apiKey: options.apiKey,
        model: options.model,
        fetchImpl: options.fetchImpl,
      });
    case 'mock':
      return new MockImageGenAdapter(options.model);
    default:
      throw new Error(
        `未知的 IMAGE_GEN_PROVIDER：${String(provider)}（支援 openai / gemini / mock）`,
      );
  }
}
