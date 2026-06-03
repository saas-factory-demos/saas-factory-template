import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Photography Studio（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #18181B / accent #F8FAFC / surface #000000。
 * 備註：Pure black + white contrast
 */
export const photographyStudio: DesignTokens = createPreset({
  meta: {
    name: 'photography-studio',
    displayName: 'Photography Studio',
    description: 'Photography Studio — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["craft-design"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#18181B',
  accentHex: '#F8FAFC',
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
