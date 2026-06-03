import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Space Tech / Aerospace（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #F8FAFC / accent #3B82F6 / surface #0B0B10。
 * 備註：Star white + launch blue
 */
export const spaceTechAerospace: DesignTokens = createPreset({
  meta: {
    name: 'space-tech-aerospace',
    displayName: 'Space Tech / Aerospace',
    description: 'Space Tech / Aerospace — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["beauty-skincare","salon"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#F8FAFC',
  accentHex: '#3B82F6',
  surfaceLight: { hue: 240, sat: 19 },
  surfaceDark: { hue: 240, sat: 19 },
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
