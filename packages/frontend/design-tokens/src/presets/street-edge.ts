import { createPreset } from './_factory.js';

/**
 * 街頭潮流：純黑 + 霓虹青、銳角、強互動，球鞋 / 街服風格。
 */
export const streetEdge = createPreset({
  meta: {
    name: 'street-edge',
    displayName: '街頭潮流',
    description: '純黑 + 霓虹青、銳角、磁吸 + 視角傾斜。球鞋 / 街服 / 滑板品牌。',
    version: '1.0.0',
    recommendedIndustries: ['fashion-apparel'],
    motionLevelRecommended: 4,
    darkModePrimary: 'both',
  },
  primaryHex: '#0a0a0a',
  accentHex: '#22d3ee',
  neutralHex: '#404040',
  surfaceLight: { hue: 0, sat: 0, fgHue: 0, fgSat: 0, fgLightness: 9 },
  surfaceDark: { hue: 0, sat: 0 },
  typography: {
    fontFamily: {
      sans: "'Space Grotesk', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Source Serif Pro', 'Noto Serif TC', serif",
      display: "'Space Grotesk', 'Noto Sans TC', system-ui, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    headingFamily: 'display',
    bodyFamily: 'sans',
    h1Size: '7xl',
    headingWeight: 'bold',
    buttonWeight: 'bold',
    buttonLetterSpacing: 'wider',
  },
  radius: 'sharp',
  shadow: { tint: '0 0 0', strength: 1.1 },
  motion: { level: 4 },
  density: 'normal',
  interaction: {
    spotlight: true,
    magnetic: true,
    focusRingStyle: 'glow',
    hoverScale: 1.03,
    focusRingColor: 'hsl(var(--color-accent-500) / 0.6)',
  },
  effects: {
    glow: true,
    perspective: true,
    patterns: { grid: true },
  },
});
