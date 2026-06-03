import { describe, expect, it } from 'vitest';

import { allThemesCss, themeToCssVars } from './css.js';
import { BUILT_IN_THEMES, ThemeRegistry } from './registry.js';

import type { ComponentVariants, ThemeKey } from './types.js';

const KEYS: ThemeKey[] = ['modern-minimal', 'luxury', 'playful', 'corporate', 'academy'];
const VARIANT_KEYS: Array<keyof ComponentVariants> = [
  'button',
  'card',
  'hero',
  'section',
  'testimonial',
  'team',
  'pricing',
  'faq',
  'badge',
  'input',
];

describe('built-in themes', () => {
  it('5 個內建主題', () => {
    expect(BUILT_IN_THEMES).toHaveLength(5);
    expect(BUILT_IN_THEMES.map((t) => t.key).sort()).toEqual([...KEYS].sort());
  });

  it.each(KEYS)('主題 %s 含完整的 component variants', (key) => {
    const t = BUILT_IN_THEMES.find((x) => x.key === key);
    expect(t).toBeDefined();
    if (!t) return;
    for (const v of VARIANT_KEYS) {
      expect(t.componentVariants[v]).toBeDefined();
    }
    // button 至少 3 種 variant
    expect(t.componentVariants.button.primary).toBeTruthy();
    expect(t.componentVariants.button.secondary).toBeTruthy();
    expect(t.componentVariants.button.ghost).toBeTruthy();
  });

  it.each(KEYS)('主題 %s 圓角符合 CLAUDE.md 規範（含 sm~2xl + full）', (key) => {
    const t = BUILT_IN_THEMES.find((x) => x.key === key);
    if (!t) throw new Error('missing');
    expect(t.radii.sm).toBeTruthy();
    expect(t.radii.md).toBeTruthy();
    expect(t.radii.lg).toBeTruthy();
    expect(t.radii.xl).toBeTruthy();
    expect(t.radii['2xl']).toBeTruthy();
    expect(t.radii.full).toBe('9999px');
  });
});

describe('ThemeRegistry', () => {
  it('預設載入 5 個主題', () => {
    const r = new ThemeRegistry();
    expect(r.list()).toHaveLength(5);
  });

  it('重複註冊同 key → throw', () => {
    const r = new ThemeRegistry();
    expect(() => r.register(BUILT_IN_THEMES[0]!)).toThrow(/已註冊/);
  });

  it('get 不存在的 key → throw', () => {
    const r = new ThemeRegistry();
    expect(() => r.get('not-exist' as ThemeKey)).toThrow(/找不到主題/);
  });

  it('has 正常運作', () => {
    const r = new ThemeRegistry();
    expect(r.has('luxury')).toBe(true);
    expect(r.has('not-exist' as ThemeKey)).toBe(false);
  });
});

describe('themeToCssVars', () => {
  it('含 palette / radii / typography 變數', () => {
    const css = themeToCssVars(BUILT_IN_THEMES[0]!);
    expect(css).toContain(':root {');
    expect(css).toContain('--color-primary:');
    expect(css).toContain('--radius-xl:');
    expect(css).toContain('--font-sans:');
    expect(css).toContain('--line-height-normal:');
  });

  it('自訂 selector', () => {
    const css = themeToCssVars(BUILT_IN_THEMES[1]!, '[data-theme="luxury"]');
    expect(css.startsWith('[data-theme="luxury"] {')).toBe(true);
  });

  it('camelCase 轉 kebab-case', () => {
    const css = themeToCssVars(BUILT_IN_THEMES[0]!);
    expect(css).toContain('--color-primary-foreground:');
    expect(css).toContain('--color-surface-muted:');
  });
});

describe('allThemesCss', () => {
  it('5 個主題各一個 data-theme 區塊', () => {
    const css = allThemesCss(BUILT_IN_THEMES);
    for (const k of KEYS) {
      expect(css).toContain(`[data-theme="${k}"] {`);
    }
  });
});
