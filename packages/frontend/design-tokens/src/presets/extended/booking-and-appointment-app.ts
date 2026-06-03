import { createPreset } from '../_factory.js';

import type { DesignTokens } from '../../types.js';

/**
 * Booking & Appointment App（ui-ux-pro-max 擴充）。
 *
 * Palette 自動生成：primary #0284C7 / accent #059669 / surface #F0F9FF。
 * 備註：Calendar blue + available green
 */
export const bookingAndAppointmentApp: DesignTokens = createPreset({
  meta: {
    name: 'booking-and-appointment-app',
    displayName: 'Booking & Appointment App',
    description: 'Booking & Appointment App — ui-ux-pro-max 擴充 palette',
    version: '1.0.0',
    recommendedIndustries: ["travel-tour"],
    motionLevelRecommended: 3,
    darkModePrimary: 'both',
  },
  primaryHex: '#0284C7',
  accentHex: '#059669',
  surfaceLight: { hue: 204, sat: 40 },
  surfaceDark: { hue: 204, sat: 30 },
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
  motion: { level: 3 },
  density: 'normal',
});
