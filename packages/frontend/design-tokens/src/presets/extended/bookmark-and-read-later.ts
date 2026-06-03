import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Bookmark & Read-Later（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #D97706 / accent #2563EB / surface #FFFBEB。
 * 備註：Warm amber + link blue
 */
export const bookmarkAndReadLater: DesignTokens = createPreset({
  meta: {
    name: 'bookmark-and-read-later',
    displayName: 'Bookmark & Read-Later',
    description: 'Bookmark & Read-Later — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#D97706',
  accentHex: '#2563EB',
  surfaceLight: { hue: 48, sat: 40 },
  surfaceDark: { hue: 48, sat: 30 },
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
