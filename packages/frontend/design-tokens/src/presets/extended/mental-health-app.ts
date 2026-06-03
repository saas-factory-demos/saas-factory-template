import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Mental Health App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #8B5CF6 / accent #059669 / surface #FAF5FF。
 * 備註：Calming lavender + wellness green [Accent adjusted from #10B981 for WCAG 3:1]
 */
export const mentalHealthApp: DesignTokens = createPreset({
  meta: {
    name: 'mental-health-app',
    displayName: 'Mental Health App',
    description: 'Mental Health App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["medical-aesthetic"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#8B5CF6',
  accentHex: '#059669',
  surfaceLight: { hue: 270, sat: 40 },
  surfaceDark: { hue: 270, sat: 30 },
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
