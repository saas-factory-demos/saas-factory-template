import type { ThemeDefinition } from './types.js';

/**
 * 把主題的 palette / radii / shadows / typography 轉為 CSS 變數區塊。
 *
 * 用法：把回傳值放進 `:root { ... }` 或自訂 selector（如 `[data-theme="luxury"] { ... }`）。
 */
export function themeToCssVars(theme: ThemeDefinition, selector = ':root'): string {
  const lines: string[] = [`${selector} {`];
  for (const [k, v] of Object.entries(theme.palette)) {
    lines.push(`  --color-${kebab(k)}: ${v};`);
  }
  for (const [k, v] of Object.entries(theme.radii)) {
    lines.push(`  --radius-${kebab(k)}: ${v};`);
  }
  for (const [k, v] of Object.entries(theme.shadows)) {
    lines.push(`  --shadow-${kebab(k)}: ${v};`);
  }
  lines.push(`  --font-sans: ${theme.typography.fontSans};`);
  if (theme.typography.fontSerif) lines.push(`  --font-serif: ${theme.typography.fontSerif};`);
  if (theme.typography.fontMono) lines.push(`  --font-mono: ${theme.typography.fontMono};`);
  lines.push(`  --font-body-size: ${theme.typography.bodySize}rem;`);
  lines.push(`  --font-heading-weight: ${theme.typography.headingWeight};`);
  lines.push(`  --font-body-weight: ${theme.typography.bodyWeight};`);
  lines.push(`  --line-height-tight: ${theme.typography.lineHeight.tight};`);
  lines.push(`  --line-height-normal: ${theme.typography.lineHeight.normal};`);
  lines.push(`  --line-height-relaxed: ${theme.typography.lineHeight.relaxed};`);
  for (const [k, v] of Object.entries(theme.typography.headingScale)) {
    lines.push(`  --font-${k}: ${v}rem;`);
  }
  lines.push(`  --section-py: ${theme.spacing.sectionPaddingY};`);
  lines.push('}');
  return lines.join('\n');
}

/**
 * 產生所有主題的 CSS（用於同一站台動態切換主題）。
 * 每個主題用 `[data-theme="<key>"]` selector 包起來。
 */
export function allThemesCss(themes: readonly ThemeDefinition[]): string {
  return themes.map((t) => themeToCssVars(t, `[data-theme="${t.key}"]`)).join('\n\n');
}

function kebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
