import type { ThemeDefinition } from '../types.js';

/**
 * Academy：暖色 + 襯線 heading + 學院氣息，適合線上課程、教育、知識付費。
 */
export const academyTheme: ThemeDefinition = {
  key: 'academy',
  label: 'Academy',
  description: '暖色 + 襯線 heading + 學院氣息；適合線上課程、教育、知識付費',
  palette: {
    background: '#fdfaf6',
    foreground: '#2d2418',
    surface: '#ffffff',
    surfaceMuted: '#f5efe6',
    border: 'rgba(139,90,43,0.18)',
    primary: '#8b5a2b',
    primaryForeground: '#ffffff',
    secondary: '#5b4b3a',
    secondaryForeground: '#ffffff',
    accent: '#c89f5b',
    accentForeground: '#2d2418',
    success: '#4d7c4b',
    warning: '#c89f5b',
    danger: '#a14d3e',
  },
  typography: {
    fontSans: '"Lora", "Noto Serif TC", serif',
    fontSerif: '"Lora", serif',
    headingScale: { h1: 3.5, h2: 2.5, h3: 1.875, h4: 1.5 },
    bodySize: 1.0625,
    lineHeight: { tight: 1.2, normal: 1.75, relaxed: 1.9 },
    headingWeight: 600,
    bodyWeight: 400,
  },
  radii: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 2px 6px rgba(139,90,43,0.08)',
    md: '0 6px 18px rgba(139,90,43,0.10)',
    lg: '0 14px 34px rgba(139,90,43,0.12)',
    xl: '0 28px 64px rgba(139,90,43,0.16)',
  },
  spacing: { unit: 4, sectionPaddingY: '7rem' },
  componentVariants: {
    button: {
      primary:
        'inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium transition-all duration-200 ease-out hover:bg-primary/90',
      secondary:
        'inline-flex items-center justify-center rounded-md border border-primary text-primary px-6 py-3 font-medium transition-all duration-200 hover:bg-primary/5',
      ghost:
        'text-foreground hover:text-primary px-4 py-2 rounded-md font-medium transition-all',
    },
    card: {
      default: 'rounded-lg border border-primary/15 bg-surface p-7',
      elevated:
        'rounded-xl bg-surface p-7 shadow-md hover:shadow-lg transition-all duration-200',
    },
    hero: {
      container: 'py-24 max-w-5xl mx-auto px-6',
      title: 'font-serif text-5xl md:text-6xl leading-tight tracking-tight',
      subtitle: 'mt-6 text-lg text-foreground/70 max-w-2xl leading-relaxed',
      cta: 'mt-8 flex gap-3',
    },
    section: {
      container: 'py-24 max-w-6xl mx-auto px-6',
      heading: 'font-serif text-4xl md:text-5xl tracking-tight',
      eyebrow:
        'text-sm uppercase tracking-widest text-primary mb-3',
    },
    testimonial: {
      card: 'rounded-lg border border-primary/15 p-7 bg-surface',
      quote: 'font-serif text-lg leading-relaxed italic',
      author: 'mt-4 text-sm font-medium text-primary',
    },
    team: {
      card: 'rounded-xl overflow-hidden border border-primary/15',
      name: 'mt-3 font-serif text-lg',
      role: 'text-sm text-foreground/60 italic',
    },
    pricing: {
      card: 'rounded-xl border border-primary/20 p-8 bg-surface',
      price: 'font-serif text-5xl text-primary',
      cta: 'mt-6 w-full rounded-md bg-primary text-primary-foreground py-3 font-medium',
    },
    faq: {
      item: 'border-b border-primary/15 py-5',
      question: 'flex justify-between font-serif text-lg',
      answer: 'mt-3 text-foreground/70 leading-relaxed',
    },
    badge: {
      default: 'inline-flex items-center rounded-full bg-accent/30 text-foreground px-3 py-1 text-xs font-medium',
      success: 'inline-flex items-center rounded-full bg-success/15 text-success px-3 py-1 text-xs font-medium',
    },
    input: {
      default:
        'w-full rounded-md border border-primary/25 bg-surface px-3 py-2.5 transition-all duration-200',
      focus: 'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
    },
  },
};
