import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Senior Care/Elderly（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0369A1 / accent #16A34A / surface #F0F9FF。
 * 備註：Calm blue + reassuring green [Accent adjusted from #22C55E for WCAG 3:1]
 */
export const seniorCareElderly: DesignTokens = createPreset({
  meta: {
    name: 'senior-care-elderly',
    displayName: 'Senior Care/Elderly',
    description: 'Senior Care/Elderly — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["logistics-trade"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#0369A1',
  accentHex: '#16A34A',
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
  motion: { level: 2 },
  density: 'normal',
});
