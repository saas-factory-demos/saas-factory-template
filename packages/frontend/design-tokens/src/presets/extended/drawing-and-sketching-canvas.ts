import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Drawing & Sketching Canvas（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #7C3AED / accent #0891B2 / surface #1C1917。
 * 備註：Canvas purple + tool teal on dark
 */
export const drawingAndSketchingCanvas: DesignTokens = createPreset({
  meta: {
    name: 'drawing-and-sketching-canvas',
    displayName: 'Drawing & Sketching Canvas',
    description: 'Drawing & Sketching Canvas — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["craft-design"],
    motionLevelRecommended: 2,
    darkModePrimary: 'both',
  },
  primaryHex: '#7C3AED',
  accentHex: '#0891B2',
  surfaceLight: { hue: 24, sat: 10 },
  surfaceDark: { hue: 24, sat: 10 },
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
