import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Ride Hailing / Transportation（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #1E293B / accent #2563EB / surface #0F172A。
 * 備註：Map dark + route blue
 */
export const rideHailingTransportation: DesignTokens = createPreset({
  meta: {
    name: 'ride-hailing-transportation',
    displayName: 'Ride Hailing / Transportation',
    description: 'Ride Hailing / Transportation — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["ai-web3"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#1E293B',
  accentHex: '#2563EB',
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
  motion: { level: 3 },
  density: 'normal',
});
