import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Travel/Tourism Agency（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0EA5E9 / accent #EA580C / surface #F0F9FF。
 * 備註：Sky blue + adventure orange [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const travelTourismAgency: DesignTokens = createPreset({
  meta: {
    name: 'travel-tourism-agency',
    displayName: 'Travel/Tourism Agency',
    description: 'Travel/Tourism Agency — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["travel-tour"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#0EA5E9',
  accentHex: '#EA580C',
  surfaceLight: { hue: 204, sat: 40 },
  surfaceDark: { hue: 204, sat: 30 },
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
  motion: { level: 3 },
  density: 'normal',
});
