import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Quantum Computing Interface（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #00FFFF / accent #FF00FF / surface #050510。
 * 備註：Quantum cyan + interference purple
 */
export const quantumComputingInterface: DesignTokens = createPreset({
  meta: {
    name: 'quantum-computing-interface',
    displayName: 'Quantum Computing Interface',
    description: 'Quantum Computing Interface — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["manufacturing"],
    motionLevelRecommended: 1,
    darkModePrimary: 'both',
  },
  primaryHex: '#00FFFF',
  accentHex: '#FF00FF',
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
  radius: 'subtle',
  motion: { level: 1 },
  density: 'normal',
});
