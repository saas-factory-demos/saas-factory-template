import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Architecture / Interior（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #171717 / accent #A16207 / surface #FFFFFF。
 * 備註：Minimal black + accent gold [Accent adjusted from #D4AF37 for WCAG 3:1]
 */
export const architectureInterior: DesignTokens = createPreset({
  meta: {
    name: 'architecture-interior',
    displayName: 'Architecture / Interior',
    description: 'Architecture / Interior — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["home-furniture"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#171717',
  accentHex: '#A16207',
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
  radius: 'sharp',
  motion: { level: 1 },
  density: 'normal',
});
