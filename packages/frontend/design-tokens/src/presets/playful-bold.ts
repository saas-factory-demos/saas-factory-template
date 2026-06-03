import { createPreset } from './_factory.js';

/**
 * 鮮明大膽：粉黃強對比、圓潤圖形、強動畫。
 *
 * 適合寵物、運動、活動、健身房等高能量品牌。
 */
export const playfulBold = createPreset({
  meta: {
    name: 'playful-bold',
    displayName: '鮮明大膽',
    description: '高飽和粉黃對比、強動畫、磁吸按鈕。寵物 / 運動 / 健身 / 活動會議。',
    version: '1.0.0',
    recommendedIndustries: ['pet-supplies', 'sports-outdoor', 'fitness-gym', 'event-conference'],
    motionLevelRecommended: 4,
    darkModePrimary: 'light',
  },
  primaryHex: '#ec4899',
  accentHex: '#facc15',
  neutralHex: '#475569',
  surfaceLight: { hue: 340, sat: 30, fgHue: 240, fgSat: 30, fgLightness: 14 },
  typography: {
    fontFamily: {
      sans: "'Plus Jakarta Sans', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'DM Serif Display', 'Noto Serif TC', serif",
      display: "'Plus Jakarta Sans', 'Noto Sans TC', system-ui, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    headingFamily: 'display',
    bodyFamily: 'sans',
    h1Size: '6xl',
    headingWeight: 'bold',
    buttonWeight: 'bold',
  },
  radius: 'plush',
  shadow: { tint: '236 72 153', strength: 0.9 },
  motion: { level: 4 },
  density: 'normal',
  interaction: {
    spotlight: false,
    magnetic: true,
    focusRingStyle: 'glow',
    hoverScale: 1.04,
    focusRingColor: 'hsl(var(--color-accent-500) / 0.55)',
  },
  effects: {
    glow: true,
    perspective: false,
    patterns: { dots: true },
  },
});
