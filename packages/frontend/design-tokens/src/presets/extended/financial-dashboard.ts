import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Financial Dashboard（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0F172A / accent #22C55E / surface #020617。
 * 備註：Dark bg + green positive indicators
 */
export const financialDashboard: DesignTokens = createPreset({
  meta: {
    name: 'financial-dashboard',
    displayName: 'Financial Dashboard',
    description: 'Financial Dashboard — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["saas-software"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#0F172A',
  accentHex: '#22C55E',
  surfaceLight: { hue: 229, sat: 40 },
  surfaceDark: { hue: 229, sat: 30 },
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
