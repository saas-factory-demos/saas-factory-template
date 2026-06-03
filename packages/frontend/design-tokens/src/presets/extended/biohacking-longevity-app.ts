import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Biohacking / Longevity App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #FF4D4D / accent #059669 / surface #F5F5F7。
 * 備註：Bio red/blue + vitality green [Accent adjusted from #00E676 for WCAG 3:1]
 */
export const biohackingLongevityApp: DesignTokens = createPreset({
  meta: {
    name: 'biohacking-longevity-app',
    displayName: 'Biohacking / Longevity App',
    description: 'Biohacking / Longevity App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#FF4D4D',
  accentHex: '#059669',
  surfaceLight: { hue: 240, sat: 11 },
  surfaceDark: { hue: 240, sat: 11 },
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
