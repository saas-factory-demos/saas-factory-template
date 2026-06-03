import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Email Client（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #2563EB / accent #DC2626 / surface #FFFFFF。
 * 備註：Inbox blue + priority red
 */
export const emailClient: DesignTokens = createPreset({
  meta: {
    name: 'email-client',
    displayName: 'Email Client',
    description: 'Email Client — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["ai-web3"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#2563EB',
  accentHex: '#DC2626',
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
  motion: { level: 3 },
  density: 'normal',
});
