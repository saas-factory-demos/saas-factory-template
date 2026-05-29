import { createPreset } from './_factory.js';

/**
 * 公民有力：紅藍對比、粗 sans、有力感、政治 / 公益。
 */
export const civicBold = createPreset({
  meta: {
    name: 'civic-bold',
    displayName: '公民有力',
    description: '紅藍對比、粗 sans、有力感。非營利 / 選舉造勢 / 倡議運動。',
    version: '1.0.0',
    recommendedIndustries: ['nonprofit', 'political-campaign'],
    motionLevelRecommended: 3,
    darkModePrimary: 'light',
  },
  primaryHex: '#dc2626',
  accentHex: '#1d4ed8',
  neutralHex: '#475569',
  surfaceLight: { hue: 0, sat: 0, fgHue: 222, fgSat: 47, fgLightness: 11 },
  typography: {
    fontFamily: {
      sans: "'Plus Jakarta Sans', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Source Serif Pro', 'Noto Serif TC', serif",
      display: "'Plus Jakarta Sans', 'Noto Sans TC', system-ui, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    headingFamily: 'sans',
    bodyFamily: 'sans',
    h1Size: '7xl',
    headingWeight: 'bold',
    buttonWeight: 'bold',
    buttonLetterSpacing: 'wider',
  },
  radius: 'subtle',
  shadow: { tint: '220 38 38', strength: 0.8 },
  motion: { level: 3 },
  density: 'normal',
  interaction: { hoverScale: 1.02 },
});
