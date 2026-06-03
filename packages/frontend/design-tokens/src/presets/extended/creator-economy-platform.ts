import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Creator Economy Platform（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #EC4899 / accent #EA580C / surface #FDF2F8。
 * 備註：Creator pink + engagement orange [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const creatorEconomyPlatform: DesignTokens = createPreset({
  meta: {
    name: 'creator-economy-platform',
    displayName: 'Creator Economy Platform',
    description: 'Creator Economy Platform — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["personal-brand"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#EC4899',
  accentHex: '#EA580C',
  surfaceLight: { hue: 327, sat: 40 },
  surfaceDark: { hue: 327, sat: 30 },
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
