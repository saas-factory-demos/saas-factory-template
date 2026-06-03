import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Hyperlocal Services（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #059669 / accent #EA580C / surface #ECFDF5。
 * 備註：Location green + action orange [Accent adjusted from #F97316 for WCAG 3:1]
 */
export const hyperlocalServices: DesignTokens = createPreset({
  meta: {
    name: 'hyperlocal-services',
    displayName: 'Hyperlocal Services',
    description: 'Hyperlocal Services — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#059669',
  accentHex: '#EA580C',
  surfaceLight: { hue: 152, sat: 40 },
  surfaceDark: { hue: 152, sat: 30 },
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
