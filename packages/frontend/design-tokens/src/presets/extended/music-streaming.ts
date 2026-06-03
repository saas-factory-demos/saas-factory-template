import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Music Streaming（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #1E1B4B / accent #22C55E / surface #0F0F23。
 * 備註：Dark audio + play green
 */
export const musicStreaming: DesignTokens = createPreset({
  meta: {
    name: 'music-streaming',
    displayName: 'Music Streaming',
    description: 'Music Streaming — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["event-conference"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#1E1B4B',
  accentHex: '#22C55E',
  surfaceLight: { hue: 240, sat: 40 },
  surfaceDark: { hue: 240, sat: 30 },
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
