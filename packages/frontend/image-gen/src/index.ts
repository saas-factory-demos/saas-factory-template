export type {
  AspectRatio,
  ImageGenAdapter,
  ImageGenRequest,
  ImageGenResult,
  ImageProvider,
  ImageSlotKind,
  ImageStyleProfile,
} from './types.js';

export {
  ImageGenAPIError,
  ImageBudgetExceededError,
  NoImageReturnedError,
} from './errors.js';

export {
  DEFAULT_IMAGE_BUDGET_USD,
  FALLBACK_IMAGE_PRICE_USD,
  IMAGE_PRICING_USD,
  ImageBudgetTracker,
  getImagePriceUsd,
} from './budget.js';
export type { ImageBudgetOptions } from './budget.js';

export { buildStyleProfile } from './style-profile.js';

export { aspectRatioForSlot, buildImagePrompt } from './prompt-builder.js';
export type { BuiltImagePrompt, ImagePromptInput } from './prompt-builder.js';

export { collectImageSlots } from './slots.js';
export type { ImageSlot } from './slots.js';

export {
  aspectScore,
  estimateBytesFromB64,
  pickBestImage,
  scoreImages,
} from './curator.js';
export type { ImageScore } from './curator.js';

export { generateBestImage } from './generate.js';
export type { GenerateBestImageOptions, GenerateBestImageResult } from './generate.js';

export {
  createImageGenAdapter,
  DEFAULT_GEMINI_IMAGE_MODEL,
  DEFAULT_OPENAI_IMAGE_MODEL,
  GeminiImageAdapter,
  MockImageGenAdapter,
  OpenAIImageAdapter,
} from './adapters/index.js';
export type {
  CreateAdapterOptions,
  GeminiImageAdapterOptions,
  OpenAIImageAdapterOptions,
  OpenAIImageQuality,
} from './adapters/index.js';
