import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * B2B Service（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0F172A / accent #0369A1 / surface #F8FAFC。
 * 備註：Professional navy + blue CTA
 */
export const b2bService: DesignTokens = createPreset({
  meta: {
    name: 'b2b-service',
    displayName: 'B2B Service',
    description: 'B2B Service — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#0F172A',
  accentHex: '#0369A1',
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
