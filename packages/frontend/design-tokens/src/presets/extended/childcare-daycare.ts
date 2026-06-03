import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Childcare/Daycare（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #F472B6 / accent #16A34A / surface #FDF2F8。
 * 備註：Soft pink + safe green [Accent adjusted from #22C55E for WCAG 3:1]
 */
export const childcareDaycare: DesignTokens = createPreset({
  meta: {
    name: 'childcare-daycare',
    displayName: 'Childcare/Daycare',
    description: 'Childcare/Daycare — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["baby-mom"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#F472B6',
  accentHex: '#16A34A',
  surfaceLight: { hue: 327, sat: 40 },
  surfaceDark: { hue: 327, sat: 30 },
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
  radius: 'plush',
  motion: { level: 2 },
  density: 'normal',
});
