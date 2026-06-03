import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Marketing Agency（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #EC4899 / accent #0891B2 / surface #FDF2F8。
 * 備註：Bold pink + creative cyan [Accent adjusted from #06B6D4 for WCAG 3:1]
 */
export const marketingAgency: DesignTokens = createPreset({
  meta: {
    name: 'marketing-agency',
    displayName: 'Marketing Agency',
    description: 'Marketing Agency — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#EC4899',
  accentHex: '#0891B2',
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
