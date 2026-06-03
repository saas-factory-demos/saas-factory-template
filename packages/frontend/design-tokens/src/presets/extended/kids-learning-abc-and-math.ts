import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Kids Learning (ABC & Math)（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #2563EB / accent #EC4899 / surface #EFF6FF。
 * 備註：Learning blue + play yellow + fun pink
 */
export const kidsLearningAbcAndMath: DesignTokens = createPreset({
  meta: {
    name: 'kids-learning-abc-and-math',
    displayName: 'Kids Learning (ABC & Math)',
    description: 'Kids Learning (ABC & Math) — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["baby-mom"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#2563EB',
  accentHex: '#EC4899',
  surfaceLight: { hue: 214, sat: 40 },
  surfaceDark: { hue: 214, sat: 30 },
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
