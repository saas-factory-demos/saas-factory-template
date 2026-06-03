import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Agriculture/Farm Tech（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #15803D / accent #A16207 / surface #F0FDF4。
 * 備註：Earth green + harvest gold [Accent adjusted from #CA8A04 for WCAG 3:1]
 */
export const agricultureFarmTech: DesignTokens = createPreset({
  meta: {
    name: 'agriculture-farm-tech',
    displayName: 'Agriculture/Farm Tech',
    description: 'Agriculture/Farm Tech — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["food-snacks"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#15803D',
  accentHex: '#A16207',
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
  motion: { level: 2 },
  density: 'normal',
});
