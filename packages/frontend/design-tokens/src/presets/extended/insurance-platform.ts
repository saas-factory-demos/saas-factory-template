import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Insurance Platform（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0369A1 / accent #16A34A / surface #F0F9FF。
 * 備註：Security blue + protected green [Accent adjusted from #22C55E for WCAG 3:1]
 */
export const insurancePlatform: DesignTokens = createPreset({
  meta: {
    name: 'insurance-platform',
    displayName: 'Insurance Platform',
    description: 'Insurance Platform — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["legal-accounting"],
    motionLevelRecommended: 1,
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
  radius: 'subtle',
  motion: { level: 1 },
  density: 'normal',
});
