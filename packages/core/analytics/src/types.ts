/**
 * 標準事件名稱（對齊 Meta Pixel 規範 + GA4 standard events）。
 *
 * goal 01 §5：PageView / ViewContent / AddToCart / InitiateCheckout /
 * AddPaymentInfo / Purchase / Lead / CompleteRegistration / Search /
 * AddToWishlist / Subscribe
 */
export type StandardEventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Search'
  | 'AddToWishlist'
  | 'Subscribe';

/**
 * 各平台 provider id。
 */
export type ProviderId =
  | 'ga4'
  | 'meta-pixel'
  | 'meta-capi'
  | 'tiktok'
  | 'line-tag'
  | 'gtm';

export interface EventContext {
  /** 使用者 id（雜湊後再送 Meta CAPI） */
  userId?: string;
  email?: string;
  phone?: string;
  /** 訪客 client id（GA4 / Meta cookie） */
  clientId?: string;
  /** event id 用於 client + server dedupe（Meta） */
  eventId?: string;
  ip?: string;
  userAgent?: string;
  /** 事件發生時刻（ms epoch） */
  eventTime?: number;
  /** 觸發頁 URL */
  sourceUrl?: string;
}

export interface PurchaseItem {
  id: string;
  name?: string;
  category?: string;
  quantity: number;
  price: number;
}

export interface AnalyticsEvent {
  name: StandardEventName;
  params?: Record<string, unknown>;
  context?: EventContext;
}

export interface PageViewParams {
  url: string;
  title?: string;
  referrer?: string;
  context?: EventContext;
}

export interface PurchaseParams {
  orderId: string;
  value: number;
  currency: string;
  items: PurchaseItem[];
  context?: EventContext;
}

export interface ProviderDispatchResult {
  provider: ProviderId;
  ok: boolean;
  error?: string;
}

/**
 * Provider 抽象：每個平台一個實作。
 *
 * Client-only platforms（GA4 / Meta Pixel / TikTok / LINE Tag）由 apps 端裝
 * 對應 script tag，並透過 `track`/`identify` 推 `window.dataLayer` 或對應 SDK；
 * server-side（Meta CAPI）負責 HTTP 呼叫。
 */
export interface AnalyticsProvider {
  id: ProviderId;
  track(event: AnalyticsEvent): Promise<ProviderDispatchResult>;
  identify(
    userId: string,
    traits: Record<string, unknown>,
  ): Promise<ProviderDispatchResult>;
}
