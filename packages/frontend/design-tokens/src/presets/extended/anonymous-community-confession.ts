import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Anonymous Community / Confession（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #475569 / accent #0891B2 / surface #0F172A。
 * 備註：Protective grey + subtle teal on dark
 */
export const anonymousCommunityConfession: DesignTokens = createPreset({
  meta: {
    name: 'anonymous-community-confession',
    displayName: 'Anonymous Community / Confession',
    description: 'Anonymous Community / Confession — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["nonprofit"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#475569',
  accentHex: '#0891B2',
  surfaceLight: { hue: 222, sat: 40 },
  surfaceDark: { hue: 222, sat: 30 },
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
