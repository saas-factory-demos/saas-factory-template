import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Dental Practice（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0EA5E9 / accent #0EA5E9 / surface #F0F9FF。
 * 備註：Fresh blue + smile yellow [Accent adjusted from #FBBF24 for WCAG 3:1]
 */
export const dentalPractice: DesignTokens = createPreset({
  meta: {
    name: 'dental-practice',
    displayName: 'Dental Practice',
    description: 'Dental Practice — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["medical-aesthetic"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#0EA5E9',
  accentHex: '#0EA5E9',
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
