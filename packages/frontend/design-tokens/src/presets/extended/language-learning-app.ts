import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Language Learning App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #4F46E5 / accent #16A34A / surface #EEF2FF。
 * 備註：Learning indigo + progress green [Accent adjusted from #22C55E for WCAG 3:1]
 */
export const languageLearningApp: DesignTokens = createPreset({
  meta: {
    name: 'language-learning-app',
    displayName: 'Language Learning App',
    description: 'Language Learning App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["online-course"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#4F46E5',
  accentHex: '#16A34A',
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
