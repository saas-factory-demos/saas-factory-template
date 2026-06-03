import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * EV/Charging Ecosystem（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0891B2 / accent #16A34A / surface #ECFEFF。
 * 備註：Electric cyan + eco green [Accent adjusted from #22C55E for WCAG 3:1]
 */
export const evChargingEcosystem: DesignTokens = createPreset({
  meta: {
    name: 'ev-charging-ecosystem',
    displayName: 'EV/Charging Ecosystem',
    description: 'EV/Charging Ecosystem — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#0891B2',
  accentHex: '#16A34A',
  surfaceLight: { hue: 183, sat: 40 },
  surfaceDark: { hue: 183, sat: 30 },
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
