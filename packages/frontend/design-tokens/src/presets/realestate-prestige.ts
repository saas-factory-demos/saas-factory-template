import { createPreset } from './_factory.js';

/**
 * 不動產尊榮：深灰藍 + 香檳金、serif、大量留白、低動畫。
 */
export const realestatePrestige = createPreset({
  meta: {
    name: 'realestate-prestige',
    displayName: '不動產尊榮',
    description: '深灰藍 + 香檳金、serif、大量留白、低調沉穩。高端不動產 / 私人豪宅銷售。',
    version: '1.0.0',
    recommendedIndustries: ['realestate'],
    motionLevelRecommended: 2,
    darkModePrimary: 'light',
  },
  primaryHex: '#1e293b',
  accentHex: '#b8860b',
  neutralHex: '#475569',
  surfaceLight: { hue: 30, sat: 15, fgHue: 222, fgSat: 30, fgLightness: 13 },
  typography: {
    fontFamily: {
      sans: "'Manrope', 'Noto Sans TC', system-ui, sans-serif",
      serif: "'Cormorant Garamond', 'Noto Serif TC', serif",
      display: "'Cormorant Garamond', 'Noto Serif TC', serif",
      mono: "'JetBrains Mono', monospace",
    },
    headingFamily: 'display',
    bodyFamily: 'serif',
    h1Size: '7xl',
    headingWeight: 'normal',
    buttonWeight: 'medium',
    buttonLetterSpacing: 'widest',
  },
  radius: 'subtle',
  shadow: { tint: '30 41 59', strength: 0.6 },
  motion: { level: 2, customBase: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)' },
  density: 'spacious',
  interaction: {
    spotlight: true,
    hoverScale: 1.015,
    focusRingColor: 'hsl(var(--color-accent-500) / 0.5)',
  },
  effects: {
    perspective: true,
    patterns: { noise: true },
    glassBlur: 'blur(32px)',
  },
});
