import type { Industry, PresetKey } from '@saas-factory/factory-types';

/**
 * Design Tokens 完整介面。
 * 11 個 category：每個 preset 都是「同一份 schema 的不同值」。
 */
export interface DesignTokens {
  meta: TokenMeta;
  colors: ColorTokens;
  typography: TypographyTokens;
  radius: RadiusTokens;
  spacing: SpacingTokens;
  shadow: ShadowTokens;
  motion: MotionTokens;
  density: DensityToken;
  interaction: InteractionTokens;
  effects: EffectTokens;
  breakpoints: BreakpointTokens;
}

/**
 * Preset 元資料：給 Wizard 與 industry-templates 用。
 */
export interface TokenMeta {
  name: PresetKey;
  displayName: string;
  description: string;
  version: string;
  basePreset?: PresetKey;
  recommendedIndustries: Industry[];
  motionLevelRecommended: 1 | 2 | 3 | 4 | 5;
  darkModePrimary: 'light' | 'dark' | 'both';
}

/**
 * 顏色 11 階。值為 HSL 三段空白分隔字串（例：`'220 90% 50%'`），
 * 由 CSS 端用 `hsl(var(--color-primary-500))` 包裹。
 */
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SurfaceTokens {
  base: string;
  raised: string;
  overlay: string;
  sunken: string;
  glass: string;
}

export interface ColorTokens {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  danger: ColorScale;
  info: ColorScale;
  neutral: ColorScale;
  surface: SurfaceTokens;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  borderSubtle: string;
  /** 暗色版（同 schema 但無遞迴）。preset 未提供時表示不支援暗色模式。 */
  dark?: Omit<ColorTokens, 'dark'>;
}

export interface FontFamilyTokens {
  sans: string;
  serif: string;
  display: string;
  mono: string;
  handwriting?: string;
}

export interface FontWeightTokens {
  thin: 100;
  light: 300;
  normal: 400;
  medium: 500;
  semibold: 600;
  bold: 700;
  extrabold: 800;
  black: 900;
}

export interface FontSizeTokens {
  '2xs': string;
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  '7xl': string;
  '8xl': string;
  '9xl': string;
}

export interface LineHeightTokens {
  none: 1;
  tight: 1.1;
  snug: 1.3;
  normal: 1.5;
  relaxed: 1.625;
  loose: 2;
}

export interface LetterSpacingTokens {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

export interface TextPreset {
  fontFamily: keyof FontFamilyTokens;
  fontSize: keyof FontSizeTokens;
  fontWeight: keyof FontWeightTokens;
  lineHeight: keyof LineHeightTokens;
  letterSpacing: keyof LetterSpacingTokens;
}

export interface TypographyTokens {
  fontFamily: FontFamilyTokens;
  fontWeight: FontWeightTokens;
  fontSize: FontSizeTokens;
  lineHeight: LineHeightTokens;
  letterSpacing: LetterSpacingTokens;
  presets: {
    h1: TextPreset;
    h2: TextPreset;
    h3: TextPreset;
    h4: TextPreset;
    h5: TextPreset;
    h6: TextPreset;
    body: TextPreset;
    bodyLarge: TextPreset;
    bodySmall: TextPreset;
    caption: TextPreset;
    overline: TextPreset;
    button: TextPreset;
    link: TextPreset;
    code: TextPreset;
  };
}

/**
 * 圓角系統。
 * 五階段 sm/md/lg/xl/2xl 必填（CLAUDE.md 第四節 backward-compat，ADR 0015）；
 * 其餘為擴充。語意化指派（button/card/...）必填。
 */
export interface RadiusTokens {
  none: '0';
  '2xs': string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  full: '9999px';
  button: string;
  card: string;
  input: string;
  modal: string;
  image: string;
}

export interface SectionSpacingTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ContainerSpacingTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  prose: string;
}

export interface SpacingTokens {
  px: '1px';
  0: '0';
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  10: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
  section: SectionSpacingTokens;
  container: ContainerSpacingTokens;
}

export interface ShadowTokens {
  none: 'none';
  '2xs': string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  soft: string;
  glow: string;
  glowAccent: string;
  colored: string;
  drop: string;
  float: string;
  layered: string;
  card: string;
  cardHover: string;
  button: string;
  buttonHover: string;
  modal: string;
  popover: string;
  dropdown: string;
}

export interface DurationTokens {
  instant: '50ms';
  fast: '150ms';
  base: '250ms';
  slow: '400ms';
  slower: '600ms';
  slowest: '1000ms';
}

export interface EasingTokens {
  linear: 'linear';
  out: string;
  in: string;
  inOut: string;
  bounce: string;
  spring: string;
  soft: string;
  sharp: string;
  elastic: string;
}

export interface TransitionTokens {
  base: string;
  colors: string;
  transform: string;
  opacity: string;
  shadow: string;
}

export interface MotionTokens {
  duration: DurationTokens;
  easing: EasingTokens;
  transition: TransitionTokens;
  motionLevel: 1 | 2 | 3 | 4 | 5;
  respectReducedMotion: boolean;
}

export type DensityToken = 'compact' | 'normal' | 'spacious';

export interface HoverTokens {
  scale: number;
  translateY: string;
  shadowIntensity: number;
  brightness: number;
}

export interface ActiveTokens {
  scale: number;
  translateY: string;
}

export interface FocusTokens {
  ringWidth: string;
  ringOffset: string;
  ringColor: string;
  ringStyle: 'solid' | 'glow';
}

export interface SpotlightTokens {
  enabled: boolean;
  size: string;
  intensity: number;
}

export interface MagneticTokens {
  enabled: boolean;
  strength: number;
  range: number;
}

export interface InteractionTokens {
  hover: HoverTokens;
  active: ActiveTokens;
  focus: FocusTokens;
  spotlight: SpotlightTokens;
  magnetic: MagneticTokens;
}

export interface GlassTokens {
  blur: string;
  saturation: number;
  bgOpacity: number;
  borderOpacity: number;
}

export interface GradientTokens {
  primary: string;
  accent: string;
  mesh: string;
  radial: string;
  conic: string;
  sunset: string;
  aurora: string;
  ocean: string;
  forest: string;
}

export interface PatternTokens {
  noise: boolean;
  grid: boolean;
  dots: boolean;
  waves: boolean;
}

export interface GlowTokens {
  enabled: boolean;
  color: string;
  size: string;
  intensity: number;
}

export interface PerspectiveTokens {
  enabled: boolean;
  distance: string;
  tilt: {
    max: number;
    reset: number;
  };
}

export interface EffectTokens {
  glass: GlassTokens;
  gradients: GradientTokens;
  patterns: PatternTokens;
  glow: GlowTokens;
  perspective: PerspectiveTokens;
}

export interface BreakpointTokens {
  sm: '640px';
  md: '768px';
  lg: '1024px';
  xl: '1280px';
  '2xl': '1536px';
}
