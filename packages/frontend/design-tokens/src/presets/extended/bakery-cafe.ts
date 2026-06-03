import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Bakery/Cafe（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #92400E / accent #92400E / surface #FEF3C7。
 * 備註：Warm brown + cream white [Accent adjusted from #F8FAFC for WCAG 3:1]
 */
export const bakeryCafe: DesignTokens = createPreset({
  meta: {
    name: 'bakery-cafe',
    displayName: 'Bakery/Cafe',
    description: 'Bakery/Cafe — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["restaurant"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#92400E',
  accentHex: '#92400E',
  surfaceLight: { hue: 48, sat: 40 },
  surfaceDark: { hue: 48, sat: 30 },
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
