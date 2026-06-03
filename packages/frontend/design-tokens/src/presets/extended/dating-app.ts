import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Dating App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #E11D48 / accent #EA580C / surface #FFF1F2。
 * 備註：Romantic rose + warm orange [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const datingApp: DesignTokens = createPreset({
  meta: {
    name: 'dating-app',
    displayName: 'Dating App',
    description: 'Dating App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#E11D48',
  accentHex: '#EA580C',
  surfaceLight: { hue: 356, sat: 40 },
  surfaceDark: { hue: 356, sat: 30 },
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
