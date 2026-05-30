/**
 * 支援語系（goal 01 §4）。
 */
export const LOCALES = [
  'zh-TW',
  'zh-CN',
  'en',
  'ja',
  'ko',
  'vi',
  'id',
  'th',
  'ms',
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'zh-TW';

/**
 * 支援貨幣（台灣本位 + 鄰近市場）。
 */
export const CURRENCIES = [
  'TWD',
  'USD',
  'JPY',
  'CNY',
  'KRW',
  'VND',
  'IDR',
  'THB',
  'MYR',
  'EUR',
] as const;

export type Currency = (typeof CURRENCIES)[number];

export type DateFormat = 'short' | 'medium' | 'long' | 'full';

/**
 * 翻譯字典：扁平 key → value，巢狀用 dot notation 在 key 中表達。
 */
export type Translations = Record<string, string>;

export type TranslationCatalog = Partial<Record<Locale, Translations>>;
