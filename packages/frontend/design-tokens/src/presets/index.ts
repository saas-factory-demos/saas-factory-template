import { PRESET_KEYS } from '@saas-factory/factory-types';

import { academyWarm } from './academy-warm.js';
import { artisanCraft } from './artisan-craft.js';
import { beautyBoutique } from './beauty-boutique.js';
import { civicBold } from './civic-bold.js';
import { corporateTrust } from './corporate-trust.js';
import { crowdfundEnergy } from './crowdfund-energy.js';
import { culinaryWarmth } from './culinary-warmth.js';
import { cyberTech } from './cyber-tech.js';
import { luxuryEditorial } from './luxury-editorial.js';
import { magazineEditorial } from './magazine-editorial.js';
import { medicalClinical } from './medical-clinical.js';
import { modernMinimal } from './modern-minimal.js';
import { nightclubNeon } from './nightclub-neon.js';
import { organicWellness } from './organic-wellness.js';
import { playfulBold } from './playful-bold.js';
import { realestatePrestige } from './realestate-prestige.js';
import { retroNostalgic } from './retro-nostalgic.js';
import { sacredSerenity } from './sacred-serenity.js';
import { streetEdge } from './street-edge.js';
import { travelEscape } from './travel-escape.js';

import type { DesignTokens, TokenMeta } from '../types.js';
import type { PresetKey } from '@saas-factory/factory-types';

/**
 * 20 套 preset registry。
 *
 * 完整對應 `PresetKey`；新增 / 移除 preset 時，`PresetKey` 與此 dict 必須同步。
 * 用 `satisfies Record<PresetKey, DesignTokens>` 在編譯期強制完整性。
 */
export const presets = {
  'modern-minimal': modernMinimal,
  'luxury-editorial': luxuryEditorial,
  'playful-bold': playfulBold,
  'corporate-trust': corporateTrust,
  'academy-warm': academyWarm,
  'organic-wellness': organicWellness,
  'street-edge': streetEdge,
  'cyber-tech': cyberTech,
  'retro-nostalgic': retroNostalgic,
  'magazine-editorial': magazineEditorial,
  'artisan-craft': artisanCraft,
  'beauty-boutique': beautyBoutique,
  'medical-clinical': medicalClinical,
  'culinary-warmth': culinaryWarmth,
  'travel-escape': travelEscape,
  'nightclub-neon': nightclubNeon,
  'sacred-serenity': sacredSerenity,
  'civic-bold': civicBold,
  'crowdfund-energy': crowdfundEnergy,
  'realestate-prestige': realestatePrestige,
} as const satisfies Record<PresetKey, DesignTokens>;

/**
 * 對應 `factory-types` 的 `PRESET_KEYS`，給 Wizard 下拉清單用。
 * 順序與 `presets` 一致。
 */
export const PRESET_LIST: readonly TokenMeta[] = PRESET_KEYS.map((key) => presets[key].meta);
