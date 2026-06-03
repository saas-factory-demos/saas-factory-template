import { INDUSTRY_METADATA } from '@saas-factory/factory-types';

import type { AspectRatio, ImageSlotKind, ImageStyleProfile } from './types.js';

/** 各 slot 類型的預設長寬比。 */
const SLOT_ASPECT_RATIO: Readonly<Record<ImageSlotKind, AspectRatio>> = Object.freeze({
  'hero-background': '16:9',
  'feature-icon': '1:1',
  gallery: '4:3',
  portrait: '3:4',
  generic: '3:2',
});

/**
 * 取 slot 類型對應的長寬比。
 *
 * @param slotKind slot 類型
 * @returns 長寬比
 */
export function aspectRatioForSlot(slotKind: ImageSlotKind): AspectRatio {
  return SLOT_ASPECT_RATIO[slotKind];
}

/** 各 slot 類型的「取景 / 構圖」指示語。 */
const SLOT_FRAMING: Readonly<Record<ImageSlotKind, string>> = Object.freeze({
  'hero-background':
    'wide cinematic hero shot with generous empty space for overlaid headline text, balanced composition',
  'feature-icon':
    'simple single-subject icon-style illustration, centered, clean solid or transparent background, minimal detail',
  gallery: 'detailed lifestyle / environment photograph, rich texture, natural depth of field',
  portrait:
    'professional environmental portrait, natural soft lighting, authentic candid feel, shallow depth of field',
  generic: 'editorial supporting image, tasteful composition, contextual to the section',
});

/** 通用品質提詞（追求高質感 —— 對應 user「圖片質感很重要」）。 */
const QUALITY_SUFFIX =
  'high quality, professional, sharp focus, well-lit, tasteful color grading, modern aesthetic, photorealistic where appropriate, 4k detail';

/** 通用 negative prompt（避免破壞質感的常見問題）。 */
const DEFAULT_NEGATIVE =
  'text, words, letters, watermark, logo, signature, ui elements, low quality, blurry, distorted, deformed, extra limbs, oversaturated, cluttered';

/** prompt-builder 輸入。 */
export interface ImagePromptInput {
  /** slot 類型。 */
  slotKind: ImageSlotKind;
  /** slot 語意主題（通常取 fixture 的 alt 文字，如「主廚特製料理」）。可空。 */
  subject?: string;
  /** 網站風格描述。 */
  styleProfile: ImageStyleProfile;
}

/** prompt-builder 輸出。 */
export interface BuiltImagePrompt {
  /** 正向 prompt。 */
  prompt: string;
  /** negative prompt。 */
  negativePrompt: string;
  /** 建議長寬比。 */
  aspectRatio: AspectRatio;
}

/**
 * 把網站風格 + slot 主題組成生圖 prompt。
 *
 * 組成順序（由具體到風格）：主題 → 產業情境 → slot 取景 → 氛圍詞 → 色調 → 明暗 → 品質尾段。
 * 為何把主題放最前：多數生圖 model 對 prompt 前段權重較高，先講「畫什麼」再講「什麼風格」。
 *
 * @param input slot 類型 / 主題 / 風格描述
 * @returns 正向 prompt + negative prompt + 建議長寬比
 */
export function buildImagePrompt(input: ImagePromptInput): BuiltImagePrompt {
  const { slotKind, subject, styleProfile } = input;
  const industryName = INDUSTRY_METADATA[styleProfile.industry]?.displayName ?? styleProfile.industry;

  const tone = styleProfile.darkMode === 'dark' ? 'dark, moody low-key lighting' : 'bright, clean lighting';
  const radiusVibe =
    styleProfile.radius === 'sharp' ? 'crisp geometric edges' : 'soft rounded forms';

  const parts: string[] = [];
  if (subject && subject.trim().length > 0) {
    parts.push(subject.trim());
  }
  parts.push(`for a ${industryName} brand website`);
  parts.push(SLOT_FRAMING[slotKind]);
  parts.push(styleProfile.mood.join(', '));
  parts.push(`color palette around ${styleProfile.primaryColor} with ${styleProfile.accentColor} accents`);
  parts.push(tone);
  parts.push(radiusVibe);
  parts.push(QUALITY_SUFFIX);

  const prompt = `${parts.filter((p) => p.length > 0).join('. ')}.`;

  return {
    prompt,
    negativePrompt: DEFAULT_NEGATIVE,
    aspectRatio: aspectRatioForSlot(slotKind),
  };
}
