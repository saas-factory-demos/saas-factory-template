import type { ThemeDefinition } from '../types.js';

/**
 * Luxury：深色 + 香檳金 + 襯線字 + 大圓角 + 慢動畫，適合精品 / 高端服務。
 */
export const luxuryTheme: ThemeDefinition = {
  key: 'luxury',
  label: 'Luxury',
  description: '深色 + 香檳金 + 襯線字；適合精品、高端服務、餐飲',
  palette: {
    background: '#0c0a09',
    foreground: '#f5f2eb',
    surface: '#1a1714',
    surfaceMuted: '#262120',
    border: 'rgba(212,175,121,0.18)',
    primary: '#c9a96e',
    primaryForeground: '#0c0a09',
    secondary: '#f5f2eb',
    secondaryForeground: '#0c0a09',
    accent: '#d4af79',
    accentForeground: '#0c0a09',
    success: '#7da982',
    warning: '#c9a96e',
    danger: '#a8615a',
  },
  typography: {
    fontSans: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSerif: '"Cormorant Garamond", serif',
    headingScale: { h1: 4, h2: 3, h3: 2.25, h4: 1.625 },
    bodySize: 1.125,
    lineHeight: { tight: 1.1, normal: 1.7, relaxed: 1.85 },
    headingWeight: 400,
    bodyWeight: 400,
  },
  radii: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.875rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 2px 8px rgba(0,0,0,0.4)',
    md: '0 8px 24px rgba(0,0,0,0.5)',
    lg: '0 16px 48px rgba(201,169,110,0.10)',
    xl: '0 32px 80px rgba(201,169,110,0.18)',
  },
  spacing: { unit: 4, sectionPaddingY: '8rem' },
  componentVariants: {
    button: {
      primary:
        'inline-flex items-center justify-center rounded-sm bg-primary text-primary-foreground px-8 py-3.5 text-sm tracking-widest uppercase font-medium transition-all duration-500 ease-out hover:bg-accent',
      secondary:
        'inline-flex items-center justify-center rounded-sm border border-primary/40 text-foreground px-8 py-3.5 text-sm tracking-widest uppercase transition-all duration-500 hover:border-primary',
      ghost:
        'text-foreground/80 hover:text-primary px-3 py-2 text-sm tracking-wider uppercase transition-all duration-500',
    },
    card: {
      default: 'rounded-lg border border-primary/20 bg-surface p-8',
      elevated:
        'rounded-xl bg-surface p-8 shadow-lg hover:shadow-xl transition-all duration-500',
    },
    hero: {
      container: 'py-32 max-w-5xl mx-auto px-6 text-center',
      title: 'font-serif text-6xl md:text-7xl leading-[1.05] tracking-tight',
      subtitle: 'mt-8 text-lg italic text-foreground/70 max-w-2xl mx-auto',
      cta: 'mt-12 flex gap-4 justify-center',
    },
    section: {
      container: 'py-28 max-w-6xl mx-auto px-6',
      heading: 'font-serif text-4xl md:text-5xl tracking-tight text-center',
      eyebrow:
        'text-xs uppercase tracking-[0.3em] text-primary mb-4 text-center',
    },
    testimonial: {
      card: 'rounded-lg border border-primary/15 p-10 bg-surface/80',
      quote: 'font-serif text-xl italic leading-relaxed text-foreground/85',
      author: 'mt-6 text-sm tracking-widest uppercase text-primary',
    },
    team: {
      card: 'rounded-2xl overflow-hidden border border-primary/15',
      name: 'mt-4 font-serif text-xl',
      role: 'text-xs tracking-widest uppercase text-primary',
    },
    pricing: {
      card: 'rounded-xl border border-primary/25 p-10 bg-surface',
      price: 'font-serif text-5xl text-primary',
      cta: 'mt-8 w-full rounded-sm bg-primary text-primary-foreground py-3.5 text-xs uppercase tracking-widest',
    },
    faq: {
      item: 'border-b border-primary/15 py-6',
      question: 'flex justify-between font-serif text-lg',
      answer: 'mt-4 text-base text-foreground/70 leading-relaxed italic',
    },
    badge: {
      default: 'inline-flex items-center rounded-sm bg-primary/10 text-primary px-3 py-1 text-xs uppercase tracking-widest',
      success: 'inline-flex items-center rounded-sm bg-success/20 text-success px-3 py-1 text-xs uppercase tracking-widest',
    },
    input: {
      default:
        'w-full rounded-sm border border-primary/25 bg-transparent px-4 py-3 text-base transition-all duration-300',
      focus: 'focus:outline-none focus:border-primary',
    },
  },
};
