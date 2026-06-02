import type { ImageStyleProfile } from './types.js';
import type { PresetKey, WizardOutput } from '@saas-factory/factory-types';


/**
 * 各 design preset 對應的「氛圍形容詞」——餵進生圖 prompt 引導視覺語言。
 *
 * 為何 hardcode 對照表：preset 是有限枚舉（20 個），逐一給精準的英文氛圍詞，
 * 比起把中文 preset 名硬塞進 prompt 更能讓 model 抓對調性。未列出的走 FALLBACK_MOOD。
 */
const PRESET_MOOD: Readonly<Record<PresetKey, string[]>> = Object.freeze({
  'modern-minimal': ['minimalist', 'clean', 'airy', 'lots of negative space'],
  'luxury-editorial': ['luxurious', 'elegant', 'high-end', 'refined', 'editorial'],
  'playful-bold': ['playful', 'bold', 'vibrant', 'energetic', 'colorful'],
  'corporate-trust': ['professional', 'trustworthy', 'corporate', 'polished'],
  'academy-warm': ['warm', 'approachable', 'inspiring', 'scholarly'],
  'organic-wellness': ['organic', 'natural', 'calm', 'soft', 'wellness'],
  'street-edge': ['edgy', 'urban', 'gritty', 'street-style', 'bold contrast'],
  'cyber-tech': ['futuristic', 'high-tech', 'sleek', 'neon accents', 'cyber'],
  'retro-nostalgic': ['retro', 'nostalgic', 'vintage tones', 'film grain'],
  'magazine-editorial': ['editorial', 'magazine-style', 'sophisticated', 'fashion'],
  'artisan-craft': ['handcrafted', 'artisanal', 'textured', 'authentic', 'rustic'],
  'beauty-boutique': ['delicate', 'elegant', 'soft glow', 'feminine', 'boutique'],
  'medical-clinical': ['clean', 'clinical', 'calm', 'trustworthy', 'bright'],
  'culinary-warmth': ['appetizing', 'warm', 'inviting', 'rich textures', 'cozy'],
  'travel-escape': ['expansive', 'wanderlust', 'scenic', 'golden hour', 'aspirational'],
  'nightclub-neon': ['nightlife', 'neon-lit', 'dramatic', 'high-energy', 'moody'],
  'sacred-serenity': ['serene', 'peaceful', 'reverent', 'soft light', 'contemplative'],
  'civic-bold': ['bold', 'civic', 'confident', 'grounded', 'community'],
  'crowdfund-energy': ['energetic', 'optimistic', 'momentum', 'inspiring', 'dynamic'],
  'realestate-prestige': ['prestigious', 'spacious', 'architectural', 'aspirational', 'crisp'],
});

/** 未知 preset 的保守氛圍詞。 */
const FALLBACK_MOOD: readonly string[] = ['professional', 'clean', 'modern'];

/**
 * 從 wizard 輸出抽出生圖用的風格描述。
 *
 * 把 theme（preset / 配色 / 圓角 / 字體 / 密度 / 暗色）+ industry 收斂成
 * 一個與 wizard schema 解耦的 ImageStyleProfile，供 prompt-builder 使用。
 *
 * @param wizard wizard 完整輸出
 * @returns 生圖風格描述
 */
export function buildStyleProfile(wizard: WizardOutput): ImageStyleProfile {
  const { theme, industry } = wizard;
  return {
    industry,
    preset: theme.presetId,
    primaryColor: theme.primaryColor,
    accentColor: theme.accentColor,
    radius: theme.radius,
    font: theme.font,
    density: theme.density,
    darkMode: theme.darkMode,
    mood: [...(PRESET_MOOD[theme.presetId] ?? FALLBACK_MOOD)],
  };
}
