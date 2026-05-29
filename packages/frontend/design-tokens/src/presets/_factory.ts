import { generateColorScale } from '../color-scale.js';

import {
  SHARED_BREAKPOINTS,
  SHARED_DURATION,
  SHARED_EASING,
  SHARED_FONT_SIZE,
  SHARED_FONT_WEIGHT,
  SHARED_LETTER_SPACING,
  SHARED_LINE_HEIGHT,
  SHARED_SPACING,
  SHARED_TRANSITION,
} from './_shared.js';

import type {
  ColorTokens,
  DensityToken,
  DesignTokens,
  EffectTokens,
  InteractionTokens,
  MotionTokens,
  RadiusTokens,
  ShadowTokens,
  TokenMeta,
  TypographyTokens,
} from '../types.js';

/**
 * 圓角風格 4 種預設，全部含五階段 sm/md/lg/xl/2xl（ADR 0015 / CLAUDE.md 第四節）。
 *
 * - `sharp`：奢華 / 雜誌 / 復古，較硬朗的設計語言
 * - `subtle`：B2B / 法律 / 不動產，企業沉穩
 * - `soft`：SaaS / 顧問 / 通用，現代溫和（modern-minimal 也走此級）
 * - `plush`：有機 / 美妝 / 母嬰，圓潤親和
 */
export type RadiusProfile = 'sharp' | 'subtle' | 'soft' | 'plush';

function makeRadius(
  scale: {
    '2xs': string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  },
  semantic: { button: string; card: string; input: string; modal: string; image: string },
): RadiusTokens {
  return {
    none: '0',
    full: '9999px',
    '2xs': scale['2xs'],
    xs: scale.xs,
    sm: scale.sm,
    md: scale.md,
    lg: scale.lg,
    xl: scale.xl,
    '2xl': scale['2xl'],
    '3xl': scale['3xl'],
    '4xl': scale['4xl'],
    button: semantic.button,
    card: semantic.card,
    input: semantic.input,
    modal: semantic.modal,
    image: semantic.image,
  };
}

const RADIUS_PROFILES: Record<RadiusProfile, RadiusTokens> = {
  sharp: makeRadius(
    {
      '2xs': '0.0625rem',
      xs: '0.125rem',
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.625rem',
      '2xl': '0.75rem',
      '3xl': '1rem',
      '4xl': '1.5rem',
    },
    { button: '0.25rem', card: '0.5rem', input: '0.25rem', modal: '0.625rem', image: '0.375rem' },
  ),
  subtle: makeRadius(
    {
      '2xs': '0.125rem',
      xs: '0.25rem',
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.625rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.25rem',
      '4xl': '1.75rem',
    },
    { button: '0.375rem', card: '0.625rem', input: '0.375rem', modal: '0.875rem', image: '0.5rem' },
  ),
  soft: makeRadius(
    {
      '2xs': '0.125rem',
      xs: '0.25rem',
      sm: '0.5rem',
      md: '0.75rem',
      lg: '0.875rem',
      xl: '1rem',
      '2xl': '1.25rem',
      '3xl': '1.5rem',
      '4xl': '2rem',
    },
    { button: '0.5rem', card: '0.875rem', input: '0.5rem', modal: '1rem', image: '0.75rem' },
  ),
  plush: makeRadius(
    {
      '2xs': '0.25rem',
      xs: '0.375rem',
      sm: '0.625rem',
      md: '0.875rem',
      lg: '1rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      '4xl': '2.5rem',
    },
    { button: '0.875rem', card: '1.25rem', input: '0.75rem', modal: '1.5rem', image: '1rem' },
  ),
};

/** 字體組合。`headingFamily` 指 h1-h4 用哪個 family，`bodyFamily` 指 body / bodyLarge / link 用哪個。 */
export interface TypographyProfile {
  fontFamily: {
    sans: string;
    serif: string;
    display: string;
    mono: string;
    handwriting?: string;
  };
  headingFamily: 'sans' | 'serif' | 'display';
  bodyFamily: 'sans' | 'serif';
  /** h1 字級，預設 '5xl'。luxury / nightclub 等大字 hero 可調 '6xl' / '7xl'。 */
  h1Size?: keyof typeof SHARED_FONT_SIZE;
  /** h1-h2 字重，預設 'bold'。serif 風通常 'normal' 或 'semibold'。 */
  headingWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** button 字重，預設 'medium'。 */
  buttonWeight?: 'medium' | 'semibold' | 'bold';
  /** button letter-spacing，預設 'normal'。奢華 / 政治走 'wider'。 */
  buttonLetterSpacing?: 'normal' | 'wide' | 'wider' | 'widest';
}

function buildTypography(profile: TypographyProfile): TypographyTokens {
  const h = profile.headingFamily;
  const b = profile.bodyFamily;
  const h1Size = profile.h1Size ?? '5xl';
  const hw = profile.headingWeight ?? 'bold';
  const btnW = profile.buttonWeight ?? 'medium';
  const btnLs = profile.buttonLetterSpacing ?? 'normal';
  return {
    fontFamily: profile.fontFamily,
    fontWeight: SHARED_FONT_WEIGHT,
    fontSize: SHARED_FONT_SIZE,
    lineHeight: SHARED_LINE_HEIGHT,
    letterSpacing: SHARED_LETTER_SPACING,
    presets: {
      h1: {
        fontFamily: h,
        fontSize: h1Size,
        fontWeight: hw,
        lineHeight: 'tight',
        letterSpacing: 'tight',
      },
      h2: {
        fontFamily: h,
        fontSize: '4xl',
        fontWeight: hw,
        lineHeight: 'tight',
        letterSpacing: 'tight',
      },
      h3: {
        fontFamily: h,
        fontSize: '3xl',
        fontWeight: 'semibold',
        lineHeight: 'snug',
        letterSpacing: 'normal',
      },
      h4: {
        fontFamily: h,
        fontSize: '2xl',
        fontWeight: 'semibold',
        lineHeight: 'snug',
        letterSpacing: 'normal',
      },
      h5: {
        fontFamily: h,
        fontSize: 'xl',
        fontWeight: 'semibold',
        lineHeight: 'snug',
        letterSpacing: 'normal',
      },
      h6: {
        fontFamily: h,
        fontSize: 'lg',
        fontWeight: 'medium',
        lineHeight: 'normal',
        letterSpacing: 'normal',
      },
      body: {
        fontFamily: b,
        fontSize: 'base',
        fontWeight: 'normal',
        lineHeight: 'relaxed',
        letterSpacing: 'normal',
      },
      bodyLarge: {
        fontFamily: b,
        fontSize: 'lg',
        fontWeight: 'normal',
        lineHeight: 'relaxed',
        letterSpacing: 'normal',
      },
      bodySmall: {
        fontFamily: b,
        fontSize: 'sm',
        fontWeight: 'normal',
        lineHeight: 'normal',
        letterSpacing: 'normal',
      },
      caption: {
        fontFamily: 'sans',
        fontSize: 'xs',
        fontWeight: 'normal',
        lineHeight: 'normal',
        letterSpacing: 'wide',
      },
      overline: {
        fontFamily: 'sans',
        fontSize: 'xs',
        fontWeight: 'semibold',
        lineHeight: 'normal',
        letterSpacing: 'widest',
      },
      button: {
        fontFamily: 'sans',
        fontSize: 'sm',
        fontWeight: btnW,
        lineHeight: 'normal',
        letterSpacing: btnLs,
      },
      link: {
        fontFamily: b,
        fontSize: 'base',
        fontWeight: 'medium',
        lineHeight: 'normal',
        letterSpacing: 'normal',
      },
      code: {
        fontFamily: 'mono',
        fontSize: 'sm',
        fontWeight: 'normal',
        lineHeight: 'normal',
        letterSpacing: 'normal',
      },
    },
  };
}

/**
 * Shadow 染色 RGB 字串（例 `'0 0 0'` 或 `'63 98 18'` 為大地色染）。
 * `strength` 1 為標準，<1 較柔，>1 較重。
 */
function buildShadow(tintRgb = '0 0 0', strength = 1): ShadowTokens {
  const a = (n: number): string => (n * strength).toFixed(2);
  return {
    none: 'none',
    '2xs': `0 1px 1px rgb(${tintRgb} / ${a(0.04)})`,
    xs: `0 1px 2px rgb(${tintRgb} / ${a(0.05)})`,
    sm: `0 1px 2px rgb(${tintRgb} / ${a(0.06)}), 0 1px 4px rgb(${tintRgb} / ${a(0.04)})`,
    md: `0 4px 6px -1px rgb(${tintRgb} / ${a(0.08)}), 0 2px 4px -2px rgb(${tintRgb} / ${a(0.05)})`,
    lg: `0 10px 15px -3px rgb(${tintRgb} / ${a(0.08)}), 0 4px 6px -4px rgb(${tintRgb} / ${a(0.06)})`,
    xl: `0 20px 25px -5px rgb(${tintRgb} / ${a(0.1)}), 0 8px 10px -6px rgb(${tintRgb} / ${a(0.06)})`,
    '2xl': `0 25px 50px -12px rgb(${tintRgb} / ${a(0.18)})`,
    inner: `inset 0 2px 4px rgb(${tintRgb} / ${a(0.05)})`,
    soft: `0 8px 30px rgb(${tintRgb} / ${a(0.08)})`,
    glow: '0 0 40px hsl(var(--color-primary-500) / 0.25)',
    glowAccent: '0 0 50px hsl(var(--color-accent-500) / 0.3)',
    colored: '0 16px 32px -8px hsl(var(--color-primary-500) / 0.2)',
    drop: `0 16px 40px rgb(${tintRgb} / ${a(0.1)})`,
    float: `0 24px 48px -12px rgb(${tintRgb} / ${a(0.18)})`,
    layered: `0 1px 2px rgb(${tintRgb} / ${a(0.04)}), 0 4px 12px rgb(${tintRgb} / ${a(0.06)}), 0 16px 32px rgb(${tintRgb} / ${a(0.08)})`,
    card: `0 1px 2px rgb(${tintRgb} / ${a(0.04)}), 0 4px 12px rgb(${tintRgb} / ${a(0.06)})`,
    cardHover: `0 4px 8px rgb(${tintRgb} / ${a(0.08)}), 0 12px 24px rgb(${tintRgb} / ${a(0.12)})`,
    button: `0 1px 2px rgb(${tintRgb} / ${a(0.06)})`,
    buttonHover: `0 4px 8px rgb(${tintRgb} / ${a(0.12)})`,
    modal: `0 24px 48px -12px rgb(${tintRgb} / ${a(0.25)})`,
    popover: `0 8px 16px -4px rgb(${tintRgb} / ${a(0.12)})`,
    dropdown: `0 4px 12px rgb(${tintRgb} / ${a(0.08)})`,
  };
}

/**
 * Preset 工廠輸入。
 * 17 套 batch-produced preset 都走此 factory；前 3 套 demo（modern-minimal / luxury-editorial /
 * organic-wellness）為了精細風格仍走手寫，作為對照基準。
 */
export interface PresetConfig {
  meta: TokenMeta;
  /** 主品牌色 hex（任何 chroma-js 可解析的格式）。 */
  primaryHex: string;
  /** 強調色 hex。 */
  accentHex: string;
  /** 中性色 hex，預設 `#525252`。 */
  neutralHex?: string;
  /** 語義色 hex 覆寫（預設值見實作）。 */
  semanticHex?: {
    success?: string;
    warning?: string;
    danger?: string;
    info?: string;
  };
  /** 明色 surface HSL：`hue` 0-360、`sat` 0-100。 */
  surfaceLight: {
    hue: number;
    sat: number;
    /** foreground 主色 H（預設 = hue），S（預設 20），L（預設 11，越小越深）。 */
    fgHue?: number;
    fgSat?: number;
    fgLightness?: number;
  };
  /** 暗色 surface（不提供 = 不含 dark mode block）。 */
  surfaceDark?: {
    hue: number;
    sat: number;
  };
  typography: TypographyProfile;
  radius: RadiusProfile;
  /** Shadow 染色設定。 */
  shadow?: {
    /** rgb 字串如 `'63 98 18'`，預設 `'0 0 0'`。 */
    tint?: string;
    /** 透明度倍率，預設 1。 */
    strength?: number;
  };
  motion: {
    level: 1 | 2 | 3 | 4 | 5;
    /** 自訂 transition.base（預設用 SHARED_TRANSITION.base）。 */
    customBase?: string;
  };
  density: DensityToken;
  /** 互動效果開關（未指定走 modern-minimal 預設）。 */
  interaction?: {
    spotlight?: boolean;
    magnetic?: boolean;
    focusRingStyle?: 'solid' | 'glow';
    /** hover scale，預設 1.02。 */
    hoverScale?: number;
    /** focus ring 顏色 token，預設 `'hsl(var(--color-primary-500) / 0.4)'`。 */
    focusRingColor?: string;
  };
  /** 視覺效果開關。 */
  effects?: {
    glow?: boolean;
    perspective?: boolean;
    patterns?: { noise?: boolean; grid?: boolean; dots?: boolean; waves?: boolean };
    /** glass blur 強度，預設 'blur(24px)'。 */
    glassBlur?: string;
  };
}

/**
 * 從輕量 `PresetConfig` 組出完整 `DesignTokens`。
 *
 * 解掉 17 套 preset 各複製 200 行的痛點：每套 preset 只需 ~50 行宣告獨特風格欄位，
 * 其餘走 shared constants + 4 種 radius / 統一 shadow tint 演算法。
 */
export function createPreset(config: PresetConfig): DesignTokens {
  const primary = generateColorScale(config.primaryHex);
  const accent = generateColorScale(config.accentHex);
  const neutral = generateColorScale(config.neutralHex ?? '#525252');
  const success = generateColorScale(config.semanticHex?.success ?? '#10b981');
  const warning = generateColorScale(config.semanticHex?.warning ?? '#f59e0b');
  const danger = generateColorScale(config.semanticHex?.danger ?? '#ef4444');
  const info = generateColorScale(config.semanticHex?.info ?? '#3b82f6');

  const { hue: lh, sat: ls } = config.surfaceLight;
  const fH = config.surfaceLight.fgHue ?? lh;
  const fS = config.surfaceLight.fgSat ?? 20;
  const fL = config.surfaceLight.fgLightness ?? 11;
  const mS = Math.max(ls - 5, 0);

  const colors: ColorTokens = {
    primary,
    secondary: neutral,
    accent,
    success,
    warning,
    danger,
    info,
    neutral,
    surface: {
      base: `${lh} ${ls}% 98%`,
      raised: `${lh} ${ls}% 100%`,
      overlay: `${lh} ${ls}% 99%`,
      sunken: `${lh} ${ls}% 96%`,
      glass: `${lh} ${ls}% 98% / 0.8`,
    },
    background: `${lh} ${ls}% 98%`,
    foreground: `${fH} ${fS}% ${fL}%`,
    muted: `${lh} ${mS}% 92%`,
    mutedForeground: `${fH} ${Math.max(fS - 5, 0)}% 40%`,
    border: `${lh} ${mS}% 86%`,
    borderSubtle: `${lh} ${mS}% 92%`,
  };

  if (config.surfaceDark) {
    const dh = config.surfaceDark.hue;
    const ds = config.surfaceDark.sat;
    colors.dark = {
      primary,
      secondary: neutral,
      accent,
      success,
      warning,
      danger,
      info,
      neutral,
      surface: {
        base: `${dh} ${ds}% 8%`,
        raised: `${dh} ${ds}% 11%`,
        overlay: `${dh} ${ds}% 14%`,
        sunken: `${dh} ${ds}% 6%`,
        glass: `${dh} ${ds}% 11% / 0.7`,
      },
      background: `${dh} ${ds}% 8%`,
      foreground: `${dh} 40% 98%`,
      muted: `${dh} ${ds}% 17%`,
      mutedForeground: `${dh} 20% 65%`,
      border: `${dh} ${ds}% 20%`,
      borderSubtle: `${dh} ${ds}% 15%`,
    };
  }

  const motion: MotionTokens = {
    duration: SHARED_DURATION,
    easing: SHARED_EASING,
    transition: config.motion.customBase
      ? { ...SHARED_TRANSITION, base: config.motion.customBase }
      : SHARED_TRANSITION,
    motionLevel: config.motion.level,
    respectReducedMotion: true,
  };

  const interaction: InteractionTokens = {
    hover: {
      scale: config.interaction?.hoverScale ?? 1.02,
      translateY: '-2px',
      shadowIntensity: 1.5,
      brightness: 1.05,
    },
    active: { scale: 0.98, translateY: '1px' },
    focus: {
      ringWidth: '3px',
      ringOffset: '2px',
      ringColor: config.interaction?.focusRingColor ?? 'hsl(var(--color-primary-500) / 0.4)',
      ringStyle: config.interaction?.focusRingStyle ?? 'solid',
    },
    spotlight: { enabled: config.interaction?.spotlight ?? false, size: '300px', intensity: 0.2 },
    magnetic: { enabled: config.interaction?.magnetic ?? false, strength: 0.3, range: 100 },
  };

  const effects: EffectTokens = {
    glass: {
      blur: config.effects?.glassBlur ?? 'blur(24px)',
      saturation: 180,
      bgOpacity: 0.7,
      borderOpacity: 0.2,
    },
    gradients: {
      primary:
        'linear-gradient(135deg, hsl(var(--color-primary-500)), hsl(var(--color-primary-700)))',
      accent:
        'linear-gradient(135deg, hsl(var(--color-accent-400)), hsl(var(--color-accent-600)))',
      mesh: 'radial-gradient(at 0% 0%, hsl(var(--color-accent-400) / 0.3), transparent 50%), radial-gradient(at 100% 100%, hsl(var(--color-primary-500) / 0.2), transparent 50%)',
      radial: 'radial-gradient(circle, hsl(var(--color-primary-500) / 0.15), transparent 70%)',
      conic:
        'conic-gradient(from 180deg, hsl(var(--color-primary-500)), hsl(var(--color-accent-500)))',
      sunset: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      aurora: 'linear-gradient(135deg, #a5b4fc, #c7d2fe)',
      ocean: 'linear-gradient(135deg, #bae6fd, #7dd3fc)',
      forest: 'linear-gradient(135deg, #bbf7d0, #86efac)',
    },
    patterns: {
      noise: config.effects?.patterns?.noise ?? false,
      grid: config.effects?.patterns?.grid ?? false,
      dots: config.effects?.patterns?.dots ?? false,
      waves: config.effects?.patterns?.waves ?? false,
    },
    glow: {
      enabled: config.effects?.glow ?? false,
      color: 'hsl(var(--color-primary-500))',
      size: '200px',
      intensity: 0.3,
    },
    perspective: {
      enabled: config.effects?.perspective ?? false,
      distance: '1000px',
      tilt: { max: 6, reset: 400 },
    },
  };

  return {
    meta: config.meta,
    colors,
    typography: buildTypography(config.typography),
    radius: RADIUS_PROFILES[config.radius],
    spacing: SHARED_SPACING,
    shadow: buildShadow(config.shadow?.tint, config.shadow?.strength),
    motion,
    density: config.density,
    interaction,
    effects,
    breakpoints: SHARED_BREAKPOINTS,
  };
}
