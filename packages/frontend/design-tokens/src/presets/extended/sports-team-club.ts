import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Sports Team/Club（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #DC2626 / accent #DC2626 / surface #FEF2F2。
 * 備註：Team red + championship gold [Accent adjusted from #FBBF24 for WCAG 3:1]
 */
export const sportsTeamClub: DesignTokens = createPreset({
  meta: {
    name: 'sports-team-club',
    displayName: 'Sports Team/Club',
    description: 'Sports Team/Club — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["fitness-gym","sports-outdoor"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#DC2626',
  accentHex: '#DC2626',
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
  radius: 'soft',
  motion: { level: 3 },
  density: 'normal',
});
