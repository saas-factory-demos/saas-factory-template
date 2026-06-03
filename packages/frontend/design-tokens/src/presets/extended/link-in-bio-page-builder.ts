import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Link-in-Bio Page Builder（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #2563EB / accent #EC4899 / surface #FFFFFF。
 * 備註：Brand blue + creator purple
 */
export const linkInBioPageBuilder: DesignTokens = createPreset({
  meta: {
    name: 'link-in-bio-page-builder',
    displayName: 'Link-in-Bio Page Builder',
    description: 'Link-in-Bio Page Builder — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["personal-brand"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#2563EB',
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
  radius: 'soft',
  motion: { level: 2 },
  density: 'normal',
});
