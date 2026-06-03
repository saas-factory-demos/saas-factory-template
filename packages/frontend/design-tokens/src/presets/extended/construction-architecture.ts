import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Construction/Architecture（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #64748B / accent #EA580C / surface #F8FAFC。
 * 備註：Industrial grey + safety orange [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const constructionArchitecture: DesignTokens = createPreset({
  meta: {
    name: 'construction-architecture',
    displayName: 'Construction/Architecture',
    description: 'Construction/Architecture — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["home-furniture"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#64748B',
  accentHex: '#EA580C',
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
  radius: 'sharp',
  motion: { level: 1 },
  density: 'normal',
});
