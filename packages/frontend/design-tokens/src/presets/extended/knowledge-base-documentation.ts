import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Knowledge Base/Documentation（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #475569 / accent #2563EB / surface #F8FAFC。
 * 備註：Neutral grey + link blue
 */
export const knowledgeBaseDocumentation: DesignTokens = createPreset({
  meta: {
    name: 'knowledge-base-documentation',
    displayName: 'Knowledge Base/Documentation',
    description: 'Knowledge Base/Documentation — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["consulting"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#475569',
  accentHex: '#2563EB',
  surfaceLight: { hue: 210, sat: 40 },
  surfaceDark: { hue: 210, sat: 30 },
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
