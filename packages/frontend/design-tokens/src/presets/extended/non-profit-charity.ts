import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Non-profit/Charity（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0891B2 / accent #EA580C / surface #ECFEFF。
 * 備註：Compassion blue + action orange [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const nonProfitCharity: DesignTokens = createPreset({
  meta: {
    name: 'non-profit-charity',
    displayName: 'Non-profit/Charity',
    description: 'Non-profit/Charity — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["nonprofit"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#0891B2',
  accentHex: '#EA580C',
  surfaceLight: { hue: 183, sat: 40 },
  surfaceDark: { hue: 183, sat: 30 },
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
