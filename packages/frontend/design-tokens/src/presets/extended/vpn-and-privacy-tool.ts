import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * VPN & Privacy Tool（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #1E3A5F / accent #22C55E / surface #0F172A。
 * 備註：Shield dark + connected green
 */
export const vpnAndPrivacyTool: DesignTokens = createPreset({
  meta: {
    name: 'vpn-and-privacy-tool',
    displayName: 'VPN & Privacy Tool',
    description: 'VPN & Privacy Tool — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["saas-software"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#1E3A5F',
  accentHex: '#22C55E',
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
  motion: { level: 2 },
  density: 'normal',
});
