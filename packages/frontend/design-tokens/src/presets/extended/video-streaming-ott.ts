import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Video Streaming/OTT（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0F0F23 / accent #E11D48 / surface #000000。
 * 備註：Cinema dark + play red
 */
export const videoStreamingOtt: DesignTokens = createPreset({
  meta: {
    name: 'video-streaming-ott',
    displayName: 'Video Streaming/OTT',
    description: 'Video Streaming/OTT — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["event-conference"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#0F0F23',
  accentHex: '#E11D48',
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
