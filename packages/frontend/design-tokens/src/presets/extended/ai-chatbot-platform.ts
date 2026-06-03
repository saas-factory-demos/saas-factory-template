import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * AI/Chatbot Platform（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #7C3AED / accent #0891B2 / surface #FAF5FF。
 * 備註：AI purple + cyan interactions [Accent adjusted from #06B6D4 for WCAG 3:1]
 */
export const aiChatbotPlatform: DesignTokens = createPreset({
  meta: {
    name: 'ai-chatbot-platform',
    displayName: 'AI/Chatbot Platform',
    description: 'AI/Chatbot Platform — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["ai-web3"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#7C3AED',
  accentHex: '#0891B2',
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
  radius: 'soft',
  motion: { level: 3 },
  density: 'normal',
});
