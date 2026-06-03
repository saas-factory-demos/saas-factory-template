import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Educational App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #4F46E5 / accent #EA580C / surface #EEF2FF。
 * 備註：Playful indigo + energetic orange [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const educationalApp: DesignTokens = createPreset({
  meta: {
    name: 'educational-app',
    displayName: 'Educational App',
    description: 'Educational App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["online-course"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#4F46E5',
  accentHex: '#EA580C',
  surfaceLight: { hue: 226, sat: 40 },
  surfaceDark: { hue: 226, sat: 30 },
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
