import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Medical Clinic（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0891B2 / accent #16A34A / surface #F0FDFA。
 * 備註：Medical teal + health green [Accent adjusted from #22C55E for WCAG 3:1]
 */
export const medicalClinic: DesignTokens = createPreset({
  meta: {
    name: 'medical-clinic',
    displayName: 'Medical Clinic',
    description: 'Medical Clinic — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["medical-aesthetic"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#0891B2',
  accentHex: '#16A34A',
  surfaceLight: { hue: 166, sat: 40 },
  surfaceDark: { hue: 166, sat: 30 },
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
