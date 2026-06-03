import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Sustainable Energy / Climate Tech（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #059669 / accent #059669 / surface #ECFDF5。
 * 備註：Nature green + solar gold [Accent adjusted from #FBBF24 for WCAG 3:1]
 */
export const sustainableEnergyClimateTech: DesignTokens = createPreset({
  meta: {
    name: 'sustainable-energy-climate-tech',
    displayName: 'Sustainable Energy / Climate Tech',
    description: 'Sustainable Energy / Climate Tech — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["ai-web3"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#059669',
  accentHex: '#059669',
  surfaceLight: { hue: 152, sat: 40 },
  surfaceDark: { hue: 152, sat: 30 },
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
