import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Yoga & Stretching Guide（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #6B7280 / accent #0891B2 / surface #F5F5F0。
 * 備註：Sage neutral + calm teal
 */
export const yogaAndStretchingGuide: DesignTokens = createPreset({
  meta: {
    name: 'yoga-and-stretching-guide',
    displayName: 'Yoga & Stretching Guide',
    description: 'Yoga & Stretching Guide — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["fitness-gym"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#6B7280',
  accentHex: '#0891B2',
  surfaceLight: { hue: 60, sat: 20 },
  surfaceDark: { hue: 60, sat: 20 },
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
