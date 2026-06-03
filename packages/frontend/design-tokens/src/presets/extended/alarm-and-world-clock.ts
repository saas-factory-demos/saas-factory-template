import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Alarm & World Clock（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #D97706 / accent #6366F1 / surface #0F172A。
 * 備註：Time amber + night indigo on dark
 */
export const alarmAndWorldClock: DesignTokens = createPreset({
  meta: {
    name: 'alarm-and-world-clock',
    displayName: 'Alarm & World Clock',
    description: 'Alarm & World Clock — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#D97706',
  accentHex: '#6366F1',
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
