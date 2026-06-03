import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Biotech / Life Sciences（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0EA5E9 / accent #059669 / surface #F0F9FF。
 * 備註：DNA blue + life green [Accent adjusted from #10B981 for WCAG 3:1]
 */
export const biotechLifeSciences: DesignTokens = createPreset({
  meta: {
    name: 'biotech-life-sciences',
    displayName: 'Biotech / Life Sciences',
    description: 'Biotech / Life Sciences — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["medical-aesthetic"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#0EA5E9',
  accentHex: '#059669',
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
