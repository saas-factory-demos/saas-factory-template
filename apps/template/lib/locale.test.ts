import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  detectLocaleFromHeader,
  isSupportedLocale,
} from './locale.js';

describe('SUPPORTED_LOCALES', () => {
  it('含 zh-TW 與 en', () => {
    expect(SUPPORTED_LOCALES).toContain('zh-TW');
    expect(SUPPORTED_LOCALES).toContain('en');
  });

  it('預設為 zh-TW', () => {
    expect(DEFAULT_LOCALE).toBe('zh-TW');
  });
});

describe('isSupportedLocale', () => {
  it('合法 locale 為 true', () => {
    expect(isSupportedLocale('zh-TW')).toBe(true);
    expect(isSupportedLocale('en')).toBe(true);
  });

  it('非法 locale 為 false', () => {
    expect(isSupportedLocale('ja')).toBe(false);
    expect(isSupportedLocale('zh-CN')).toBe(false);
    expect(isSupportedLocale('')).toBe(false);
  });
});

describe('detectLocaleFromHeader', () => {
  it('null / 空字串 → DEFAULT_LOCALE', () => {
    expect(detectLocaleFromHeader(null)).toBe('zh-TW');
    expect(detectLocaleFromHeader('')).toBe('zh-TW');
  });

  it('完整匹配 zh-TW', () => {
    expect(detectLocaleFromHeader('zh-TW,en;q=0.9')).toBe('zh-TW');
  });

  it('完整匹配 en', () => {
    expect(detectLocaleFromHeader('en-US,en;q=0.9')).toBe('en');
  });

  it('主語碼 zh → zh-TW', () => {
    expect(detectLocaleFromHeader('zh-CN,zh;q=0.9')).toBe('zh-TW');
  });

  it('主語碼 en → en', () => {
    expect(detectLocaleFromHeader('en-GB')).toBe('en');
  });

  it('無支援者 → DEFAULT_LOCALE', () => {
    expect(detectLocaleFromHeader('ja,ko;q=0.9')).toBe('zh-TW');
  });

  it('q 權重忽略，順序為準', () => {
    expect(detectLocaleFromHeader('en;q=0.5,zh-TW;q=0.9')).toBe('en');
  });
});
