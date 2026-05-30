/** 主題色板。 */
export interface ThemePalette {
  background: string;
  foreground: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  success: string;
  warning: string;
  danger: string;
}

/** 字體設定。 */
export interface ThemeTypography {
  fontSans: string;
  fontSerif?: string;
  fontMono?: string;
  /** heading 用字級（rem）。 */
  headingScale: { h1: number; h2: number; h3: number; h4: number };
  /** body 字級（rem）。 */
  bodySize: number;
  /** 行高倍率。 */
  lineHeight: { tight: number; normal: number; relaxed: number };
  /** heading 字重。 */
  headingWeight: number;
  /** body 字重。 */
  bodyWeight: number;
}

/** 圓角設定（依 CLAUDE.md 規範）。 */
export interface ThemeRadii {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

/** 陰影設定。 */
export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/** 間距節奏（px 為單位的倍數）。 */
export interface ThemeSpacing {
  unit: number;
  sectionPaddingY: string;
}

/**
 * Component variants：每個 block 在不同主題下的 class 字串，
 * consumer（前台 React 元件）依 `theme.componentVariants[blockKey]` 取對應 class。
 */
export interface ComponentVariants {
  button: { primary: string; secondary: string; ghost: string };
  card: { default: string; elevated: string };
  hero: { container: string; title: string; subtitle: string; cta: string };
  section: { container: string; heading: string; eyebrow: string };
  testimonial: { card: string; quote: string; author: string };
  team: { card: string; name: string; role: string };
  pricing: { card: string; price: string; cta: string };
  faq: { item: string; question: string; answer: string };
  badge: { default: string; success: string };
  input: { default: string; focus: string };
}

/** 主題完整定義。 */
export interface ThemeDefinition {
  /** 主題 key（不可重複）。 */
  key: ThemeKey;
  label: string;
  description: string;
  palette: ThemePalette;
  typography: ThemeTypography;
  radii: ThemeRadii;
  shadows: ThemeShadows;
  spacing: ThemeSpacing;
  componentVariants: ComponentVariants;
}

/** 5 個內建主題 key。 */
export type ThemeKey = 'modern-minimal' | 'luxury' | 'playful' | 'corporate' | 'academy';
