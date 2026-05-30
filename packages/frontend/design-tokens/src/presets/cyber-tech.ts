import { createPreset } from './_factory.js';

/**
 * 賽博科技：紫青配色、暗色主導、grid + glow，AI / Web3 / 科技配件。
 */
export const cyberTech = createPreset({
  meta: {
    name: 'cyber-tech',
    displayName: '賽博科技',
    description: '紫青漸層、暗色主導、grid 紋路 + glow。AI / Web3 / 科技配件。',
    version: '1.0.0',
    recommendedIndustries: ['tech-accessories', 'ai-web3'],
    motionLevelRecommended: 4,
    darkModePrimary: 'dark',
  },
  primaryHex: '#7c3aed',
  accentHex: '#06b6d4',
  neutralHex: '#3f3f46',
  surfaceLight: { hue: 260, sat: 15, fgHue: 260, fgSat: 30, fgLightness: 14 },
  surfaceDark: { hue: 260, sat: 30 },
  typography: {
    fontFamily: {
      sans: "'Space Grotesk', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Source Serif Pro', 'Noto Serif TC', serif",
      display: "'Space Grotesk', 'Noto Sans TC', system-ui, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    headingFamily: 'display',
    bodyFamily: 'sans',
    h1Size: '6xl',
    headingWeight: 'bold',
    buttonWeight: 'semibold',
    buttonLetterSpacing: 'wider',
  },
  radius: 'sharp',
  shadow: { tint: '124 58 237', strength: 0.8 },
  motion: { level: 4 },
  density: 'normal',
  interaction: {
    spotlight: true,
    magnetic: true,
    focusRingStyle: 'glow',
    focusRingColor: 'hsl(var(--color-accent-500) / 0.6)',
  },
  effects: {
    glow: true,
    perspective: true,
    patterns: { grid: true, noise: true },
    glassBlur: 'blur(20px)',
  },
});
