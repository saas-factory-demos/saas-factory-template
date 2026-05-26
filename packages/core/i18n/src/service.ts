import { DEFAULT_LOCALE } from './types.js';

import type {
  Currency,
  DateFormat,
  Locale,
  TranslationCatalog,
} from './types.js';

/**
 * I18nService 介面（goal 01 §4）。
 */
export interface I18nService {
  t(key: string, params?: Record<string, unknown>, locale?: Locale): string;
  formatCurrency(amount: number, currency: Currency, locale?: Locale): string;
  formatDate(date: Date, format?: DateFormat, locale?: Locale): string;
  formatNumber(num: number, locale?: Locale): string;
}

export interface I18nConfig {
  catalog: TranslationCatalog;
  defaultLocale?: Locale;
  /** 找不到 key 時的 fallback：'key'（回 key 字串）或 'empty'（回空字串） */
  missingKey?: 'key' | 'empty';
}

/**
 * 自維 JSON 字典實作（ADR-0010 §6）。
 *
 * 翻譯資料來源：apps 端的 `messages/<locale>.json`。Crowdin / Lokalise 之類
 * 第三方平台暫不接（避免外部相依，等真正多語客戶上線再切）。
 */
export class JsonI18nService implements I18nService {
  private readonly catalog: TranslationCatalog;
  private readonly defaultLocale: Locale;
  private readonly missingKey: 'key' | 'empty';

  constructor(config: I18nConfig) {
    this.catalog = config.catalog;
    this.defaultLocale = config.defaultLocale ?? DEFAULT_LOCALE;
    this.missingKey = config.missingKey ?? 'key';
  }

  t(key: string, params?: Record<string, unknown>, locale?: Locale): string {
    const loc = locale ?? this.defaultLocale;
    const dict = this.catalog[loc] ?? this.catalog[this.defaultLocale] ?? {};
    const raw = dict[key];
    if (raw === undefined) {
      return this.missingKey === 'key' ? key : '';
    }
    if (!params) return raw;
    return raw.replace(/\{(\w+)\}/g, (_match, name: string) => {
      const value = params[name];
      return value === undefined || value === null ? '' : String(value);
    });
  }

  formatCurrency(amount: number, currency: Currency, locale?: Locale): string {
    return new Intl.NumberFormat(locale ?? this.defaultLocale, {
      style: 'currency',
      currency,
    }).format(amount);
  }

  formatDate(date: Date, format: DateFormat = 'medium', locale?: Locale): string {
    return new Intl.DateTimeFormat(locale ?? this.defaultLocale, {
      dateStyle: format,
    }).format(date);
  }

  formatNumber(num: number, locale?: Locale): string {
    return new Intl.NumberFormat(locale ?? this.defaultLocale).format(num);
  }
}
