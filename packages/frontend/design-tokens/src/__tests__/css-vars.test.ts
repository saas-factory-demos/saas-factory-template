import { describe, expect, it } from 'vitest';

import { generateCSSVariables } from '../css-vars.js';
import { modernMinimal } from '../presets/modern-minimal.js';

describe('generateCSSVariables', () => {
  it('預設輸出 :root 選擇器', () => {
    const css = generateCSSVariables(modernMinimal);
    expect(css.startsWith(':root {')).toBe(true);
    expect(css.includes('--color-primary-500:')).toBe(true);
    expect(css.includes('--radius-sm:')).toBe(true);
    expect(css.includes('--radius-md:')).toBe(true);
    expect(css.includes('--radius-lg:')).toBe(true);
    expect(css.includes('--radius-xl:')).toBe(true);
    expect(css.includes('--radius-2xl:')).toBe(true);
  });

  it('輸出五階段 radius（ADR 0015 backward-compat）', () => {
    const css = generateCSSVariables(modernMinimal);
    // CLAUDE.md 第四節五階段必須全部存在
    expect(css).toMatch(/--radius-sm: 0\.5rem/);
    expect(css).toMatch(/--radius-md: 0\.75rem/);
    expect(css).toMatch(/--radius-lg: 0\.875rem/);
    expect(css).toMatch(/--radius-xl: 1rem/);
    expect(css).toMatch(/--radius-2xl: 1\.25rem/);
  });

  it('輸出語意化 radius（button / card / input / modal / image）', () => {
    const css = generateCSSVariables(modernMinimal);
    expect(css.includes('--radius-button:')).toBe(true);
    expect(css.includes('--radius-card:')).toBe(true);
    expect(css.includes('--radius-input:')).toBe(true);
    expect(css.includes('--radius-modal:')).toBe(true);
    expect(css.includes('--radius-image:')).toBe(true);
  });

  it('支援自訂 selector（multi-preset 並存）', () => {
    const css = generateCSSVariables(modernMinimal, '[data-preset="modern-minimal"]');
    expect(css.startsWith('[data-preset="modern-minimal"] {')).toBe(true);
  });

  it('有暗色版時輸出 [data-theme="dark"] block', () => {
    const css = generateCSSVariables(modernMinimal);
    expect(css.includes('[data-theme="dark"]')).toBe(true);
  });

  it('motion / shadow / typography tokens 都有出', () => {
    const css = generateCSSVariables(modernMinimal);
    expect(css.includes('--duration-base:')).toBe(true);
    expect(css.includes('--ease-out:')).toBe(true);
    expect(css.includes('--shadow-card:')).toBe(true);
    expect(css.includes('--font-sans:')).toBe(true);
    expect(css.includes('--motion-level: 2')).toBe(true);
    expect(css.includes('--density: normal')).toBe(true);
  });
});
