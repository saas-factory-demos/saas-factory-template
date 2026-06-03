import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Public Transit Guide（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #2563EB / accent #EA580C / surface #F8FAFC。
 * 備註：Transit blue + line colors
 */
export const publicTransitGuide: DesignTokens = createPreset({
  meta: {
    name: 'public-transit-guide',
    displayName: 'Public Transit Guide',
    description: 'Public Transit Guide — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["logistics-trade"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#2563EB',
  accentHex: '#EA580C',
  surfaceLight: { hue: 210, sat: 40 },
  surfaceDark: { hue: 210, sat: 30 },
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
