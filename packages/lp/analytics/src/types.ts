/** 漏斗 6 事件（與 Meta Pixel / GA4 / Conversion API 對齊）。 */
export type LpEventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase';

/** 漏斗順序。 */
export const FUNNEL_ORDER: LpEventName[] = [
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Purchase',
];

/** UTM 來源資訊（行銷 campaign 追蹤）。 */
export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

/** 事件 payload。 */
export interface LpEvent {
  tenantId: string;
  pageId: string;
  /** 同一訪客同一 session 同一 sessionId。 */
  sessionId: string;
  visitorId: string;
  event: LpEventName;
  /** Purchase 必填（minor）。 */
  valueMinor?: number;
  /** Purchase 必填。 */
  currency?: string;
  /** 訂單 id（Purchase）。 */
  orderId?: string;
  utm?: UtmParams;
  /** 事件發生時間。 */
  occurredAt: Date;
}

/** 廣告花費紀錄（每個 campaign 每日）。 */
export interface AdSpendEntry {
  tenantId: string;
  pageId: string;
  campaign: string;
  /** 該日花費（minor）。 */
  spendMinor: number;
  /** 日期 yyyy-mm-dd。 */
  date: string;
}

/** 漏斗單一階段統計。 */
export interface FunnelStepStats {
  event: LpEventName;
  /** 不重複 visitor 數。 */
  uniqueVisitors: number;
  /** 相對前一階段的轉換率。 */
  stepConversionRate: number;
  /** 相對 PageView 的累計轉換率。 */
  overallConversionRate: number;
}

/** 來源彙整。 */
export interface SourceStats {
  source: string;
  medium: string;
  campaign: string;
  visitors: number;
  purchases: number;
  conversionRate: number;
  revenueMinor: number;
  spendMinor: number;
  /** revenue / spend；無花費為 Infinity。 */
  roas: number;
  /** spend / purchases；無轉換為 Infinity。 */
  cpaMinor: number;
}
