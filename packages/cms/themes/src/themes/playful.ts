import type { ThemeDefinition } from '../types.js';

/**
 * Playful：鮮豔配色 + 大圓角 + 手寫風 + 強烈微動畫，適合電商、生活風格、寵物。
 */
export const playfulTheme: ThemeDefinition = {
  key: 'playful',
  label: 'Playful',
  description: '鮮豔配色 + 大圓角 + 手寫風；適合電商、生活、寵物、親子',
  palette: {
    background: '#fff8f1',
    foreground: '#1a1717',
    surface: '#ffffff',
    surfaceMuted: '#fef0e5',
    border: 'rgba(255,107,107,0.18)',
    primary: '#ff6b6b',
    primaryForeground: '#ffffff',
    secondary: '#4ecdc4',
    secondaryForeground: '#0a3a36',
    accent: '#ffe66d',
    accentForeground: '#1a1717',
    success: '#51cf66',
    warning: '#ffd43b',
    danger: '#ff6b6b',
  },
  typography: {
    fontSans: '"Quicksand", "Noto Sans TC", system-ui, sans-serif',
    headingScale: { h1: 4, h2: 2.75, h3: 2, h4: 1.5 },
    bodySize: 1.05,
    lineHeight: { tight: 1.2, normal: 1.65, relaxed: 1.8 },
    headingWeight: 700,
    bodyWeight: 500,
  },
  radii: {
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.75rem',
    '2xl': '2rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 4px 12px rgba(255,107,107,0.10)',
    md: '0 8px 24px rgba(255,107,107,0.15)',
    lg: '0 16px 40px rgba(255,107,107,0.18)',
    xl: '0 24px 60px rgba(255,107,107,0.22)',
  },
  spacing: { unit: 4, sectionPaddingY: '6rem' },
  componentVariants: {
    button: {
      primary:
        'inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-7 py-3 font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg',
      secondary:
        'inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground px-7 py-3 font-semibold transition-all duration-200 hover:-translate-y-0.5',
      ghost:
        'text-foreground hover:bg-surface px-4 py-2 rounded-full font-medium transition-all duration-200',
    },
    card: {
      default: 'rounded-2xl bg-surface p-7 shadow-sm',
      elevated:
        'rounded-2xl bg-surface p-7 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200',
    },
    hero: {
      container: 'py-20 max-w-5xl mx-auto px-6',
      title: 'text-5xl md:text-7xl font-bold leading-[1.05]',
      subtitle: 'mt-6 text-xl text-foreground/75 max-w-2xl leading-relaxed',
      cta: 'mt-10 flex flex-wrap gap-3',
    },
    section: {
      container: 'py-20 max-w-6xl mx-auto px-6',
      heading: 'text-4xl md:text-5xl font-bold',
      eyebrow:
        'inline-block rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-bold uppercase tracking-wide mb-4',
    },
    testimonial: {
      card: 'rounded-2xl bg-surface p-7 shadow-md',
      quote: 'text-lg leading-relaxed',
      author: 'mt-4 text-sm font-semibold text-primary',
    },
    team: {
      card: 'rounded-2xl overflow-hidden bg-surface shadow-md hover:shadow-lg transition-all duration-200',
      name: 'mt-3 text-lg font-bold',
      role: 'text-sm text-foreground/65',
    },
    pricing: {
      card: 'rounded-2xl bg-surface p-8 shadow-md',
      price: 'text-5xl font-bold text-primary',
      cta: 'mt-6 w-full rounded-full bg-primary text-primary-foreground py-3 font-semibold',
    },
    faq: {
      item: 'rounded-xl bg-surface p-5 mb-3',
      question: 'flex justify-between font-semibold',
      answer: 'mt-3 text-foreground/75 leading-relaxed',
    },
    badge: {
      default: 'inline-flex items-center rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-bold',
      success: 'inline-flex items-center rounded-full bg-success/20 text-success px-3 py-1 text-xs font-bold',
    },
    input: {
      default:
        'w-full rounded-xl border-2 border-primary/20 bg-surface px-4 py-3 transition-all duration-200',
      focus: 'focus:outline-none focus:border-primary',
    },
  },
};
