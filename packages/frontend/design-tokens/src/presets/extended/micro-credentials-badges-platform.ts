import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Micro-Credentials/Badges Platform（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0369A1 / accent #A16207 / surface #F0F9FF。
 * 備註：Trust blue + achievement gold [Accent adjusted from #CA8A04 for WCAG 3:1]
 */
export const microCredentialsBadgesPlatform: DesignTokens = createPreset({
  meta: {
    name: 'micro-credentials-badges-platform',
    displayName: 'Micro-Credentials/Badges Platform',
    description: 'Micro-Credentials/Badges Platform — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#0369A1',
  accentHex: '#A16207',
  surfaceLight: { hue: 204, sat: 40 },
  surfaceDark: { hue: 204, sat: 30 },
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
