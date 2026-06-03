import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Productivity Tool（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0D9488 / accent #EA580C / surface #F0FDFA。
 * 備註：Teal focus + action orange [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const productivityTool: DesignTokens = createPreset({
  meta: {
    name: 'productivity-tool',
    displayName: 'Productivity Tool',
    description: 'Productivity Tool — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["saas-software"],
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
