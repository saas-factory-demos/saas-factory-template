import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Wallpaper & Theme App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #7C3AED / accent #2563EB / surface #FAF5FF。
 * 備註：Aesthetic purple + trending pink
 */
export const wallpaperAndThemeApp: DesignTokens = createPreset({
  meta: {
    name: 'wallpaper-and-theme-app',
    displayName: 'Wallpaper & Theme App',
    description: 'Wallpaper & Theme App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#7C3AED',
  accentHex: '#2563EB',
  surfaceLight: { hue: 270, sat: 40 },
  surfaceDark: { hue: 270, sat: 30 },
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
