import { describe, expect, it } from 'vitest';

import {
  JsonI18nService,
  LOCALES,
  buildHreflangs,
  getLocaleFromPath,
  negotiateLocale,
} from './index.js';

describe('JsonI18nService', () => {
  const service = new JsonI18nService({
    catalog: {
      'zh-TW': { hello: '你好 {name}', welcome: '歡迎' },
      en: { hello: 'Hello {name}', welcome: 'Welcome' },
    },
    defaultLocale: 'zh-TW',
  });

  it('t 用預設語系', () => {
    expect(service.t('welcome')).toBe('歡迎');
  });

  it('t 切換語系', () => {
    expect(service.t('welcome', undefined, 'en')).toBe('Welcome');
  });

  it('t 帶 params 插值', () => {
    expect(service.t('hello', { name: 'Ephraim' })).toBe('你好 Ephraim');
  });

  it('t 找不到 key 預設回 key', () => {
    expect(service.t('missing')).toBe('missing');
  });

  it('formatCurrency TWD', () => {
    const out = service.formatCurrency(1234, 'TWD', 'zh-TW');
    expect(out).toMatch(/1,234/);
  });

  it('formatNumber', () => {
    expect(service.formatNumber(1234567, 'en')).toBe('1,234,567');
  });
});

describe('locale helpers', () => {
  it('getLocaleFromPath 抓出 zh-TW', () => {
    expect(getLocaleFromPath('/zh-TW/products')).toBe('zh-TW');
  });

  it('getLocaleFromPath 找不到回 null', () => {
    expect(getLocaleFromPath('/products')).toBeNull();
  });

  it('negotiateLocale exact match', () => {
    expect(negotiateLocale('zh-TW,en;q=0.9')).toBe('zh-TW');
  });

  it('negotiateLocale 無 header 回預設', () => {
    expect(negotiateLocale(undefined)).toBe('zh-TW');
  });

  it('buildHreflangs 對所有 LOCALES 都產出', () => {
    const tags = buildHreflangs('https://x.com', '/p');
    expect(tags.length).toBe(LOCALES.length);
    expect(tags[0]).toEqual({
      hreflang: 'zh-TW',
      href: 'https://x.com/zh-TW/p',
    });
  });
});
