import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Pet Tech App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #F97316 / accent #2563EB / surface #FFF7ED。
 * 備註：Playful orange + trust blue
 */
export const petTechApp: DesignTokens = createPreset({
  meta: {
    name: 'pet-tech-app',
    displayName: 'Pet Tech App',
    description: 'Pet Tech App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["pet-supplies"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#F97316',
  accentHex: '#2563EB',
  surfaceLight: { hue: 33, sat: 40 },
  surfaceDark: { hue: 33, sat: 30 },
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
