import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Banking/Traditional Finance（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0F172A / accent #A16207 / surface #F8FAFC。
 * 備註：Trust navy + premium gold [Accent adjusted from #CA8A04 for WCAG 3:1]
 */
export const bankingTraditionalFinance: DesignTokens = createPreset({
  meta: {
    name: 'banking-traditional-finance',
    displayName: 'Banking/Traditional Finance',
    description: 'Banking/Traditional Finance — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["legal-accounting"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#0F172A',
  accentHex: '#A16207',
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
  radius: 'subtle',
  motion: { level: 1 },
  density: 'normal',
});
