import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Home Decoration & Interior Design（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #78716C / accent #D97706 / surface #FAF5F2。
 * 備註：Interior warm grey + gold accent
 */
export const homeDecorationAndInteriorDesign: DesignTokens = createPreset({
  meta: {
    name: 'home-decoration-and-interior-design',
    displayName: 'Home Decoration & Interior Design',
    description: 'Home Decoration & Interior Design — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["home-furniture"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#78716C',
  accentHex: '#D97706',
  surfaceLight: { hue: 23, sat: 40 },
  surfaceDark: { hue: 23, sat: 30 },
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
