import { createPreset } from './_factory.js';

/**
 * 復古懷舊：暖紅 + 琥珀、粗 serif、雜訊紋路。
 *
 * 適合復古品牌、黑膠、咖啡、酒類等懷舊感品牌。
 */
export const retroNostalgic = createPreset({
  meta: {
    name: 'retro-nostalgic',
    displayName: '復古懷舊',
    description: '暖紅 + 琥珀、serif 標題、雜訊紋路。黑膠 / 咖啡 / 復古品牌。',
    version: '1.0.0',
    recommendedIndustries: ['food-snacks', 'craft-design'],
    motionLevelRecommended: 2,
    darkModePrimary: 'light',
  },
  primaryHex: '#b91c1c',
  accentHex: '#d97706',
  neutralHex: '#57534e',
  surfaceLight: { hue: 30, sat: 30, fgHue: 20, fgSat: 30, fgLightness: 14 },
  typography: {
    fontFamily: {
      sans: "'Karla', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Playfair Display', 'Noto Serif TC', serif",
      display: "'Bebas Neue', 'Noto Sans TC', sans-serif",
      mono: "'Courier Prime', monospace",
    },
    headingFamily: 'display',
    bodyFamily: 'serif',
    h1Size: '7xl',
    headingWeight: 'normal',
    buttonWeight: 'bold',
    buttonLetterSpacing: 'widest',
  },
  radius: 'subtle',
  shadow: { tint: '185 28 28', strength: 0.7 },
  motion: { level: 2 },
  density: 'normal',
  effects: {
    patterns: { noise: true },
  },
});
