import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Local Events & Discovery（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #EA580C / accent #2563EB / surface #FFF7ED。
 * 備註：Event orange + map blue
 */
export const localEventsAndDiscovery: DesignTokens = createPreset({
  meta: {
    name: 'local-events-and-discovery',
    displayName: 'Local Events & Discovery',
    description: 'Local Events & Discovery — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["event-conference"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#EA580C',
  accentHex: '#2563EB',
  surfaceLight: { hue: 33, sat: 40 },
  surfaceDark: { hue: 33, sat: 30 },
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
