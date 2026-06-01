import { createPreset } from './_factory.js';

/**
 * 募資能量：綠 + 橘、動感、磁吸 + glow，群眾募資 / 新創。
 */
export const crowdfundEnergy = createPreset({
  meta: {
    name: 'crowdfund-energy',
    displayName: '募資能量',
    description: '綠 + 橘、動感、磁吸 + glow。群眾募資 / 新創 / 早鳥活動。',
    version: '1.0.0',
    recommendedIndustries: ['crowdfunding'],
    motionLevelRecommended: 4,
    darkModePrimary: 'light',
  },
  primaryHex: '#16a34a',
  accentHex: '#ea580c',
  neutralHex: '#475569',
  surfaceLight: { hue: 140, sat: 20, fgHue: 140, fgSat: 30, fgLightness: 13 },
  typography: {
    fontFamily: {
      sans: "'Plus Jakarta Sans', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Source Serif Pro', 'Noto Serif TC', serif",
      display: "'Plus Jakarta Sans', 'Noto Sans TC', system-ui, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    headingFamily: 'display',
    bodyFamily: 'sans',
    h1Size: '6xl',
    headingWeight: 'bold',
    buttonWeight: 'bold',
  },
  radius: 'soft',
  shadow: { tint: '22 163 74', strength: 0.7 },
  motion: { level: 4 },
  density: 'normal',
  interaction: {
    magnetic: true,
    focusRingStyle: 'glow',
    hoverScale: 1.03,
    focusRingColor: 'hsl(var(--color-accent-500) / 0.55)',
  },
  effects: {
    glow: true,
    patterns: { dots: true },
  },
});
