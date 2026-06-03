import { createPreset } from './_factory.js';

/**
 * 餐飲暖意：暖紅 + 橘、display serif、圓潤、食慾色系。
 */
export const culinaryWarmth = createPreset({
  meta: {
    name: 'culinary-warmth',
    displayName: '餐飲暖意',
    description: '暖紅 + 橘、display serif、食慾色系。餐飲 / 食品零食。',
    version: '1.0.0',
    recommendedIndustries: ['food-snacks', 'restaurant'],
    motionLevelRecommended: 3,
    darkModePrimary: 'light',
  },
  primaryHex: '#dc2626',
  accentHex: '#f97316',
  neutralHex: '#57534e',
  surfaceLight: { hue: 30, sat: 30, fgHue: 20, fgSat: 30, fgLightness: 13 },
  typography: {
    fontFamily: {
      sans: "'Manrope', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Lora', 'Noto Serif TC', serif",
      display: "'Fraunces', 'Noto Serif TC', serif",
      mono: "'JetBrains Mono', monospace",
      handwriting: "'Caveat', cursive",
    },
    headingFamily: 'display',
    bodyFamily: 'sans',
    h1Size: '6xl',
    headingWeight: 'semibold',
    buttonWeight: 'semibold',
  },
  radius: 'plush',
  shadow: { tint: '220 38 38', strength: 0.7 },
  motion: { level: 3, customBase: 'all 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
  density: 'normal',
  interaction: {
    magnetic: true,
    hoverScale: 1.03,
    focusRingStyle: 'glow',
    focusRingColor: 'hsl(var(--color-accent-500) / 0.5)',
  },
  effects: {
    glow: true,
    patterns: { noise: true },
  },
});
