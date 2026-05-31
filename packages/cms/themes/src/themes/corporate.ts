import type { ThemeDefinition } from '../types.js';

/**
 * Corporate：藍色穩重 + 嚴謹排版 + 中等圓角，適合企業、金融、B2B。
 */
export const corporateTheme: ThemeDefinition = {
  key: 'corporate',
  label: 'Corporate',
  description: '藍色穩重 + 嚴謹排版；適合企業、金融、B2B 服務',
  palette: {
    background: '#ffffff',
    foreground: '#0f172a',
    surface: '#f8fafc',
    surfaceMuted: '#eef2f7',
    border: 'rgba(15,23,42,0.10)',
    primary: '#1e40af',
    primaryForeground: '#ffffff',
    secondary: '#475569',
    secondaryForeground: '#ffffff',
    accent: '#0ea5e9',
    accentForeground: '#ffffff',
    success: '#15803d',
    warning: '#ca8a04',
    danger: '#b91c1c',
  },
  typography: {
    fontSans: '"IBM Plex Sans", "Noto Sans TC", system-ui, sans-serif',
    fontSerif: '"IBM Plex Serif", serif',
    headingScale: { h1: 3.25, h2: 2.25, h3: 1.75, h4: 1.375 },
    bodySize: 1,
    lineHeight: { tight: 1.2, normal: 1.6, relaxed: 1.75 },
    headingWeight: 600,
    bodyWeight: 400,
  },
  radii: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px rgba(15,23,42,0.06)',
    md: '0 4px 12px rgba(15,23,42,0.08)',
    lg: '0 10px 28px rgba(15,23,42,0.10)',
    xl: '0 20px 50px rgba(15,23,42,0.14)',
  },
  spacing: { unit: 4, sectionPaddingY: '6rem' },
  componentVariants: {
    button: {
      primary:
        'inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-2.5 font-medium transition-all duration-200 ease-out hover:bg-primary/90',
      secondary:
        'inline-flex items-center justify-center rounded-md border border-primary text-primary px-6 py-2.5 font-medium transition-all duration-200 hover:bg-primary/5',
      ghost:
        'text-foreground hover:bg-surface px-4 py-2 rounded-md font-medium transition-all',
    },
    card: {
      default: 'rounded-lg border border-black/10 bg-surface p-6',
      elevated:
        'rounded-lg bg-background p-6 shadow-sm hover:shadow-md transition-all duration-200',
    },
    hero: {
      container: 'py-24 max-w-6xl mx-auto px-6',
      title: 'text-5xl md:text-6xl font-semibold leading-tight tracking-tight',
      subtitle: 'mt-6 text-lg text-foreground/70 max-w-3xl',
      cta: 'mt-8 flex flex-wrap gap-3',
    },
    section: {
      container: 'py-20 max-w-6xl mx-auto px-6',
      heading: 'text-3xl md:text-4xl font-semibold tracking-tight',
      eyebrow:
        'text-sm font-semibold uppercase tracking-wider text-primary mb-3',
    },
    testimonial: {
      card: 'rounded-lg border border-black/10 p-6 bg-surface',
      quote: 'text-base leading-relaxed text-foreground/85',
      author: 'mt-4 text-sm font-semibold',
    },
    team: {
      card: 'rounded-lg overflow-hidden border border-black/10',
      name: 'mt-3 text-base font-semibold',
      role: 'text-sm text-foreground/60',
    },
    pricing: {
      card: 'rounded-lg border border-black/10 p-8 bg-surface',
      price: 'text-4xl font-semibold text-primary',
      cta: 'mt-6 w-full rounded-md bg-primary text-primary-foreground py-2.5 font-medium',
    },
    faq: {
      item: 'border-b border-black/10 py-5',
      question: 'flex justify-between text-base font-medium',
      answer: 'mt-3 text-foreground/70 leading-relaxed',
    },
    badge: {
      default: 'inline-flex items-center rounded-md bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium',
      success: 'inline-flex items-center rounded-md bg-success/10 text-success px-2.5 py-0.5 text-xs font-medium',
    },
    input: {
      default:
        'w-full rounded-md border border-black/15 bg-background px-3 py-2 transition-all duration-200',
      focus: 'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
    },
  },
};
