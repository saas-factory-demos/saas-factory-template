import type { ThemeDefinition } from '../types.js';

/**
 * Modern Minimal：黑白灰 + 大量留白 + 細邊框，適合科技 / SaaS / 顧問。
 */
export const modernMinimalTheme: ThemeDefinition = {
  key: 'modern-minimal',
  label: 'Modern Minimal',
  description: '黑白灰 + 留白 + 細邊框；適合科技、SaaS、顧問品牌',
  palette: {
    background: '#ffffff',
    foreground: '#0a0a0a',
    surface: '#fafafa',
    surfaceMuted: '#f4f4f5',
    border: 'rgba(0,0,0,0.08)',
    primary: '#0a0a0a',
    primaryForeground: '#ffffff',
    secondary: '#27272a',
    secondaryForeground: '#fafafa',
    accent: '#3b82f6',
    accentForeground: '#ffffff',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
  },
  typography: {
    fontSans: '"Inter", "Noto Sans TC", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", monospace',
    headingScale: { h1: 3.5, h2: 2.5, h3: 1.875, h4: 1.5 },
    bodySize: 1,
    lineHeight: { tight: 1.15, normal: 1.6, relaxed: 1.75 },
    headingWeight: 600,
    bodyWeight: 400,
  },
  radii: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '0.875rem',
    xl: '1rem',
    '2xl': '1.25rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    md: '0 4px 12px rgba(0,0,0,0.06)',
    lg: '0 12px 32px rgba(0,0,0,0.08)',
    xl: '0 24px 64px rgba(0,0,0,0.10)',
  },
  spacing: { unit: 4, sectionPaddingY: '6rem' },
  componentVariants: {
    button: {
      primary:
        'inline-flex items-center justify-center rounded-md bg-foreground text-background px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out hover:opacity-90',
      secondary:
        'inline-flex items-center justify-center rounded-md border border-black/10 px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out hover:bg-surface',
      ghost: 'text-foreground hover:bg-surface px-3 py-2 rounded-md text-sm transition-all',
    },
    card: {
      default: 'rounded-lg border border-black/10 bg-surface p-6',
      elevated: 'rounded-xl bg-background p-6 shadow-sm hover:shadow-md transition-all duration-200',
    },
    hero: {
      container: 'py-24 max-w-5xl mx-auto px-6',
      title: 'text-5xl md:text-6xl font-semibold tracking-tight leading-tight',
      subtitle: 'mt-6 text-lg text-foreground/70 max-w-2xl leading-relaxed',
      cta: 'mt-8 flex gap-3',
    },
    section: {
      container: 'py-20 max-w-6xl mx-auto px-6',
      heading: 'text-3xl md:text-4xl font-semibold tracking-tight',
      eyebrow: 'text-xs uppercase tracking-widest text-foreground/50 mb-3',
    },
    testimonial: {
      card: 'rounded-lg border border-black/10 p-6 bg-surface',
      quote: 'text-base text-foreground/80 leading-relaxed',
      author: 'mt-4 text-sm font-medium',
    },
    team: {
      card: 'rounded-xl overflow-hidden border border-black/10',
      name: 'mt-3 text-base font-medium',
      role: 'text-sm text-foreground/60',
    },
    pricing: {
      card: 'rounded-xl border border-black/10 p-8',
      price: 'text-4xl font-semibold',
      cta: 'mt-6 w-full rounded-md bg-foreground text-background py-2.5 text-sm font-medium',
    },
    faq: {
      item: 'border-b border-black/10 py-5',
      question: 'flex justify-between text-base font-medium',
      answer: 'mt-3 text-sm text-foreground/70 leading-relaxed',
    },
    badge: {
      default: 'inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-xs',
      success: 'inline-flex items-center rounded-full bg-success/10 text-success px-2.5 py-0.5 text-xs',
    },
    input: {
      default:
        'w-full rounded-md border border-black/10 bg-background px-3 py-2 text-sm transition-all duration-200',
      focus: 'focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20',
    },
  },
};
