import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * News/Media Platform（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #DC2626 / accent #1E40AF / surface #FEF2F2。
 * 備註：Breaking red + link blue
 */
export const newsMediaPlatform: DesignTokens = createPreset({
  meta: {
    name: 'news-media-platform',
    displayName: 'News/Media Platform',
    description: 'News/Media Platform — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#DC2626',
  accentHex: '#1E40AF',
  surfaceLight: { hue: 0, sat: 40 },
  surfaceDark: { hue: 0, sat: 30 },
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
