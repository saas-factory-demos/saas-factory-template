import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Design System/Component Library（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #4F46E5 / accent #EA580C / surface #EEF2FF。
 * 備註：Indigo brand + doc hierarchy [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const designSystemComponentLibrary: DesignTokens = createPreset({
  meta: {
    name: 'design-system-component-library',
    displayName: 'Design System/Component Library',
    description: 'Design System/Component Library — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["craft-design"],
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
