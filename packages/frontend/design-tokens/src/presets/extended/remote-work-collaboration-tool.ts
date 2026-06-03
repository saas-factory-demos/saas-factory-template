import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Remote Work/Collaboration Tool（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #6366F1 / accent #059669 / surface #F5F3FF。
 * 備註：Calm indigo + success green [Accent adjusted from #10B981 for WCAG 3:1]
 */
export const remoteWorkCollaborationTool: DesignTokens = createPreset({
  meta: {
    name: 'remote-work-collaboration-tool',
    displayName: 'Remote Work/Collaboration Tool',
    description: 'Remote Work/Collaboration Tool — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["saas-software"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#6366F1',
  accentHex: '#059669',
  surfaceLight: { hue: 250, sat: 40 },
  surfaceDark: { hue: 250, sat: 30 },
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
