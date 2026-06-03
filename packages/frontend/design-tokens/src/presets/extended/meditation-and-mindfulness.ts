import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Meditation & Mindfulness（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #7C3AED / accent #059669 / surface #FAF5FF。
 * 備註：Calm lavender + mindful green
 */
export const meditationAndMindfulness: DesignTokens = createPreset({
  meta: {
    name: 'meditation-and-mindfulness',
    displayName: 'Meditation & Mindfulness',
    description: 'Meditation & Mindfulness — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["fitness-gym"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#7C3AED',
  accentHex: '#059669',
  surfaceLight: { hue: 270, sat: 40 },
  surfaceDark: { hue: 270, sat: 30 },
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
