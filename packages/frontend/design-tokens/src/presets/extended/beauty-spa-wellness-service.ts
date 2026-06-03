import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Beauty/Spa/Wellness Service（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #EC4899 / accent #8B5CF6 / surface #FDF2F8。
 * 備註：Soft pink + lavender luxury
 */
export const beautySpaWellnessService: DesignTokens = createPreset({
  meta: {
    name: 'beauty-spa-wellness-service',
    displayName: 'Beauty/Spa/Wellness Service',
    description: 'Beauty/Spa/Wellness Service — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["beauty-skincare","salon"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#EC4899',
  accentHex: '#8B5CF6',
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
  radius: 'plush',
  motion: { level: 2 },
  density: 'normal',
});
