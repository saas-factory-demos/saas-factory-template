import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Portfolio/Personal（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #18181B / accent #2563EB / surface #FAFAFA。
 * 備註：Monochrome + blue accent
 */
export const portfolioPersonal: DesignTokens = createPreset({
  meta: {
    name: 'portfolio-personal',
    displayName: 'Portfolio/Personal',
    description: 'Portfolio/Personal — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["personal-brand"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#18181B',
  accentHex: '#2563EB',
  surfaceLight: { hue: 0, sat: 0 },
  surfaceDark: { hue: 0, sat: 0 },
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
