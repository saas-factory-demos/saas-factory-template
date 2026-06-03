import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Online Course/E-learning（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0D9488 / accent #EA580C / surface #F0FDFA。
 * 備註：Progress teal + achievement orange [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const onlineCourseELearning: DesignTokens = createPreset({
  meta: {
    name: 'online-course-e-learning',
    displayName: 'Online Course/E-learning',
    description: 'Online Course/E-learning — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["online-course"],
    motionLevelRecommended: 2,
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
  radius: 'soft',
  motion: { level: 2 },
  density: 'normal',
});
