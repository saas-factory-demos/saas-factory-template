import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Trivia & Quiz Game（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #2563EB / accent #F59E0B / surface #EFF6FF。
 * 備註：Quiz blue + gold leaderboard
 */
export const triviaAndQuizGame: DesignTokens = createPreset({
  meta: {
    name: 'trivia-and-quiz-game',
    displayName: 'Trivia & Quiz Game',
    description: 'Trivia & Quiz Game — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#2563EB',
  accentHex: '#F59E0B',
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
  radius: 'soft',
  motion: { level: 2 },
  density: 'normal',
});
