import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Florist/Plant Shop（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #15803D / accent #EC4899 / surface #F0FDF4。
 * 備註：Natural green + floral pink
 */
export const floristPlantShop: DesignTokens = createPreset({
  meta: {
    name: 'florist-plant-shop',
    displayName: 'Florist/Plant Shop',
    description: 'Florist/Plant Shop — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["fashion-apparel"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#15803D',
  accentHex: '#EC4899',
  surfaceLight: { hue: 138, sat: 40 },
  surfaceDark: { hue: 138, sat: 30 },
  typography: {
    fontFamily: {
      sans: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Source Serif Pro', 'Noto Serif TC', serif",
      display: "'Inter', 'Noto Sans TC', system-ui, sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    headingFamily: 'sans',
    bodyFamily: 'sans',
  },
  radius: 'soft',
  motion: { level: 3 },
  density: 'normal',
});
