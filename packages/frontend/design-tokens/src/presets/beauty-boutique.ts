import { createPreset } from './_factory.js';

/**
 * 美妝精品：玫瑰金 + 杏色、display serif、spotlight + glow。
 *
 * 適合美妝、SPA、沙龍、醫美等精品服務。
 */
export const beautyBoutique = createPreset({
  meta: {
    name: 'beauty-boutique',
    displayName: '美妝精品',
    description: '玫瑰金 + 杏色、display serif、spotlight + glow。美妝 / SPA / 沙龍 / 醫美。',
    version: '1.0.0',
    recommendedIndustries: ['beauty-skincare', 'salon', 'medical-aesthetic'],
    motionLevelRecommended: 3,
    darkModePrimary: 'light',
  },
  primaryHex: '#be185d',
  accentHex: '#d4af37',
  neutralHex: '#57534e',
  surfaceLight: { hue: 350, sat: 25, fgHue: 340, fgSat: 25, fgLightness: 13 },
  typography: {
    fontFamily: {
      sans: "'Manrope', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Cormorant Garamond', 'Noto Serif TC', serif",
      display: "'Cormorant Garamond', 'Noto Serif TC', serif",
      mono: "'JetBrains Mono', monospace",
      handwriting: "'Allura', cursive",
    },
    headingFamily: 'display',
    bodyFamily: 'sans',
    h1Size: '7xl',
    headingWeight: 'normal',
    buttonWeight: 'medium',
    buttonLetterSpacing: 'wider',
  },
  radius: 'plush',
  shadow: { tint: '190 24 93', strength: 0.6 },
  motion: { level: 3, customBase: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)' },
  density: 'spacious',
  interaction: {
    spotlight: true,
    magnetic: false,
    focusRingStyle: 'glow',
    hoverScale: 1.02,
    focusRingColor: 'hsl(var(--color-accent-500) / 0.5)',
  },
  effects: {
    glow: true,
    perspective: true,
    patterns: { noise: true },
    glassBlur: 'blur(28px)',
  },
});
