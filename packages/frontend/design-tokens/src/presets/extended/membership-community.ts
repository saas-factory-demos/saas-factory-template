import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Membership/Community（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #7C3AED / accent #16A34A / surface #FAF5FF。
 * 備註：Community purple + join green [Accent adjusted from #22C55E for WCAG 3:1]
 */
export const membershipCommunity: DesignTokens = createPreset({
  meta: {
    name: 'membership-community',
    displayName: 'Membership/Community',
    description: 'Membership/Community — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["nonprofit"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#7C3AED',
  accentHex: '#16A34A',
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
