import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * E-commerce Luxury（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #1C1917 / accent #A16207 / surface #FAFAF9。
 * 備註：Premium dark + gold accent [Accent adjusted from #CA8A04 for WCAG 3:1]
 */
export const eCommerceLuxury: DesignTokens = createPreset({
  meta: {
    name: 'e-commerce-luxury',
    displayName: 'E-commerce Luxury',
    description: 'E-commerce Luxury — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["personal-brand"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#1C1917',
  accentHex: '#A16207',
  surfaceLight: { hue: 60, sat: 9 },
  surfaceDark: { hue: 60, sat: 9 },
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
  radius: 'sharp',
  motion: { level: 1 },
  density: 'normal',
});
