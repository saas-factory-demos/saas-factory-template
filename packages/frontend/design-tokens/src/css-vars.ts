import type { ColorScale, DesignTokens } from './types.js';

const SCALE_KEYS: (keyof ColorScale)[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const COLOR_FAMILIES = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'] as const;

function indent(line: string): string {
  return `  ${line}`;
}

function colorScaleLines(prefix: string, scale: ColorScale): string[] {
  return SCALE_KEYS.map((k) => indent(`--color-${prefix}-${k}: ${scale[k]};`));
}

function colorTokenLines(tokens: DesignTokens['colors']): string[] {
  const lines: string[] = [];
  for (const family of COLOR_FAMILIES) {
    lines.push(...colorScaleLines(family, tokens[family]));
  }
  lines.push(
    indent(`--surface-base: ${tokens.surface.base};`),
    indent(`--surface-raised: ${tokens.surface.raised};`),
    indent(`--surface-overlay: ${tokens.surface.overlay};`),
    indent(`--surface-sunken: ${tokens.surface.sunken};`),
    indent(`--surface-glass: ${tokens.surface.glass};`),
    indent(`--color-background: ${tokens.background};`),
    indent(`--color-foreground: ${tokens.foreground};`),
    indent(`--color-muted: ${tokens.muted};`),
    indent(`--color-muted-foreground: ${tokens.mutedForeground};`),
    indent(`--color-border: ${tokens.border};`),
    indent(`--color-border-subtle: ${tokens.borderSubtle};`),
  );
  return lines;
}

function radiusLines(tokens: DesignTokens['radius']): string[] {
  return [
    `--radius-none: ${tokens.none};`,
    `--radius-2xs: ${tokens['2xs']};`,
    `--radius-xs: ${tokens.xs};`,
    `--radius-sm: ${tokens.sm};`,
    `--radius-md: ${tokens.md};`,
    `--radius-lg: ${tokens.lg};`,
    `--radius-xl: ${tokens.xl};`,
    `--radius-2xl: ${tokens['2xl']};`,
    `--radius-3xl: ${tokens['3xl']};`,
    `--radius-4xl: ${tokens['4xl']};`,
    `--radius-full: ${tokens.full};`,
    `--radius-button: ${tokens.button};`,
    `--radius-card: ${tokens.card};`,
    `--radius-input: ${tokens.input};`,
    `--radius-modal: ${tokens.modal};`,
    `--radius-image: ${tokens.image};`,
  ].map(indent);
}

function typographyLines(tokens: DesignTokens['typography']): string[] {
  const lines: string[] = [];
  lines.push(
    indent(`--font-sans: ${tokens.fontFamily.sans};`),
    indent(`--font-serif: ${tokens.fontFamily.serif};`),
    indent(`--font-display: ${tokens.fontFamily.display};`),
    indent(`--font-mono: ${tokens.fontFamily.mono};`),
  );
  if (tokens.fontFamily.handwriting) {
    lines.push(indent(`--font-handwriting: ${tokens.fontFamily.handwriting};`));
  }
  for (const [k, v] of Object.entries(tokens.fontSize)) {
    lines.push(indent(`--font-size-${k}: ${v};`));
  }
  return lines;
}

function shadowLines(tokens: DesignTokens['shadow']): string[] {
  return [
    `--shadow-none: ${tokens.none};`,
    `--shadow-xs: ${tokens.xs};`,
    `--shadow-sm: ${tokens.sm};`,
    `--shadow-md: ${tokens.md};`,
    `--shadow-lg: ${tokens.lg};`,
    `--shadow-xl: ${tokens.xl};`,
    `--shadow-2xl: ${tokens['2xl']};`,
    `--shadow-soft: ${tokens.soft};`,
    `--shadow-glow: ${tokens.glow};`,
    `--shadow-card: ${tokens.card};`,
    `--shadow-card-hover: ${tokens.cardHover};`,
    `--shadow-button: ${tokens.button};`,
    `--shadow-modal: ${tokens.modal};`,
  ].map(indent);
}

function motionLines(tokens: DesignTokens['motion']): string[] {
  return [
    `--duration-instant: ${tokens.duration.instant};`,
    `--duration-fast: ${tokens.duration.fast};`,
    `--duration-base: ${tokens.duration.base};`,
    `--duration-slow: ${tokens.duration.slow};`,
    `--ease-out: ${tokens.easing.out};`,
    `--ease-in: ${tokens.easing.in};`,
    `--ease-in-out: ${tokens.easing.inOut};`,
    `--ease-spring: ${tokens.easing.spring};`,
    `--motion-level: ${tokens.motionLevel};`,
  ].map(indent);
}

/**
 * 將完整 `DesignTokens` 序列化成可注入 `:root` / `[data-preset]` 的 CSS 字串。
 *
 * @param tokens 任一 preset 的完整 token
 * @param selector 預設 `:root`。多 preset 並存時改用 `[data-preset="luxury-editorial"]`
 */
export function generateCSSVariables(tokens: DesignTokens, selector = ':root'): string {
  const lines: string[] = [];
  lines.push(`${selector} {`);
  lines.push(...colorTokenLines(tokens.colors));
  lines.push(...typographyLines(tokens.typography));
  lines.push(...radiusLines(tokens.radius));
  lines.push(...shadowLines(tokens.shadow));
  lines.push(...motionLines(tokens.motion));
  lines.push(indent(`--density: ${tokens.density};`));
  lines.push('}');

  if (tokens.colors.dark) {
    lines.push('');
    lines.push(`${selector === ':root' ? '[data-theme="dark"]' : `${selector}[data-theme="dark"]`} {`);
    lines.push(...colorTokenLines(tokens.colors.dark));
    lines.push('}');
  }

  return lines.join('\n');
}
