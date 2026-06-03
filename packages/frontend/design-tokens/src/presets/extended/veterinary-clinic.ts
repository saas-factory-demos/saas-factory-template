import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Veterinary Clinic（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0D9488 / accent #EA580C / surface #F0FDFA。
 * 備註：Caring teal + warm orange [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const veterinaryClinic: DesignTokens = createPreset({
  meta: {
    name: 'veterinary-clinic',
    displayName: 'Veterinary Clinic',
    description: 'Veterinary Clinic — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["medical-aesthetic"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#0D9488',
  accentHex: '#EA580C',
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
