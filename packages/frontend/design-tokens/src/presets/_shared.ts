import type {
  BreakpointTokens,
  DurationTokens,
  EasingTokens,
  FontSizeTokens,
  FontWeightTokens,
  LetterSpacingTokens,
  LineHeightTokens,
  SpacingTokens,
  TransitionTokens,
} from '../types.js';

/**
 * 共用 spacing 數值（Tailwind 對應）。
 * 個別 preset 不應覆寫此值；要拉「鬆 / 緊」改 `section` / `container` 與 `density`。
 */
export const SHARED_SPACING: SpacingTokens = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
  section: { sm: '3rem', md: '5rem', lg: '8rem', xl: '12rem' },
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    prose: '65ch',
  },
};

export const SHARED_BREAKPOINTS: BreakpointTokens = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const SHARED_FONT_WEIGHT: FontWeightTokens = {
  thin: 100,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

export const SHARED_FONT_SIZE: FontSizeTokens = {
  '2xs': '0.625rem',
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
  '8xl': '6rem',
  '9xl': '8rem',
};

export const SHARED_LINE_HEIGHT: LineHeightTokens = {
  none: 1,
  tight: 1.1,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

export const SHARED_LETTER_SPACING: LetterSpacingTokens = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

export const SHARED_DURATION: DurationTokens = {
  instant: '50ms',
  fast: '150ms',
  base: '250ms',
  slow: '400ms',
  slower: '600ms',
  slowest: '1000ms',
};

export const SHARED_EASING: EasingTokens = {
  linear: 'linear',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  soft: 'cubic-bezier(0.4, 0, 0.6, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
};

export const SHARED_TRANSITION: TransitionTokens = {
  base: 'all 250ms cubic-bezier(0, 0, 0.2, 1)',
  colors: 'color 250ms ease-out, background-color 250ms ease-out, border-color 250ms ease-out',
  transform: 'transform 250ms cubic-bezier(0, 0, 0.2, 1)',
  opacity: 'opacity 250ms ease-out',
  shadow: 'box-shadow 250ms ease-out',
};
