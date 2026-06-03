import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Healthcare App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0891B2 / accent #059669 / surface #ECFEFF。
 * 備註：Calm cyan + health green
 */
export const healthcareApp: DesignTokens = createPreset({
  meta: {
    name: 'healthcare-app',
    displayName: 'Healthcare App',
    description: 'Healthcare App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["medical-aesthetic"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#0891B2',
  accentHex: '#059669',
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
  radius: 'subtle',
  motion: { level: 1 },
  density: 'normal',
});
