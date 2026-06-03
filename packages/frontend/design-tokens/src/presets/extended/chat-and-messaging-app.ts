import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Chat & Messaging App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #2563EB / accent #059669 / surface #FFFFFF。
 * 備註：Messenger blue + online green
 */
export const chatAndMessagingApp: DesignTokens = createPreset({
  meta: {
    name: 'chat-and-messaging-app',
    displayName: 'Chat & Messaging App',
    description: 'Chat & Messaging App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#2563EB',
  accentHex: '#059669',
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
