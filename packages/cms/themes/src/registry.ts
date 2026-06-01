import { academyTheme } from './themes/academy.js';
import { corporateTheme } from './themes/corporate.js';
import { luxuryTheme } from './themes/luxury.js';
import { modernMinimalTheme } from './themes/modern-minimal.js';
import { playfulTheme } from './themes/playful.js';

import type { ThemeDefinition, ThemeKey } from './types.js';

/** 5 個內建主題。 */
export const BUILT_IN_THEMES: readonly ThemeDefinition[] = [
  modernMinimalTheme,
  luxuryTheme,
  playfulTheme,
  corporateTheme,
  academyTheme,
];

/**
 * 簡易 theme registry。
 */
export class ThemeRegistry {
  private readonly themes = new Map<ThemeKey, ThemeDefinition>();

  constructor(initial: readonly ThemeDefinition[] = BUILT_IN_THEMES) {
    for (const t of initial) this.register(t);
  }

  register(theme: ThemeDefinition): void {
    if (this.themes.has(theme.key)) {
      throw new Error(`主題 key 已註冊：${theme.key}`);
    }
    this.themes.set(theme.key, theme);
  }

  get(key: ThemeKey): ThemeDefinition {
    const t = this.themes.get(key);
    if (!t) throw new Error(`找不到主題：${key}`);
    return t;
  }

  has(key: ThemeKey): boolean {
    return this.themes.has(key);
  }

  list(): ThemeDefinition[] {
    return [...this.themes.values()];
  }
}
