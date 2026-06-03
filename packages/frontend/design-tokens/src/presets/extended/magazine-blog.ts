import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Magazine/Blog（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #18181B / accent #EC4899 / surface #FAFAFA。
 * 備註：Editorial black + accent pink
 */
export const magazineBlog: DesignTokens = createPreset({
  meta: {
    name: 'magazine-blog',
    displayName: 'Magazine/Blog',
    description: 'Magazine/Blog — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#18181B',
  accentHex: '#EC4899',
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
