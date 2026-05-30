/** OTO（One-Time Offer）每層的設定。 */
export interface UpsellOffer {
  /** 唯一 id（後台拖拉用）。 */
  id: string;
  /** 加購商品 id。 */
  productId: string;
  /** 顯示在加購頁的標題（例如「等等，老闆加碼」）。 */
  headline: string;
  /** 行銷文案（HTML 由 lp-builder 處理）。 */
  body?: string;
  /** 加購原價（minor）。 */
  priceMinor: number;
  /** 折扣後價（minor，可選）。 */
  discountedPriceMinor?: number;
}

/** 完整 funnel 設定（後台拖拉產出）。 */
export interface UpsellFunnelConfig {
  tenantId: string;
  pageId: string;
  /** OTO 依序執行；空陣列代表直接到感謝頁。 */
  offers: UpsellOffer[];
  /** 感謝頁 slug。 */
  thankYouSlug: string;
}

/** 訪客進入 funnel 後的狀態機。 */
export interface UpsellSession {
  id: string;
  tenantId: string;
  orderId: string;
  funnelConfig: UpsellFunnelConfig;
  /** 目前所在 offer index（0..offers.length-1）；=== offers.length 代表已走完。 */
  cursor: number;
  /** 已接受的 offer id 列表。 */
  acceptedOfferIds: string[];
  /** 已跳過的 offer id 列表。 */
  skippedOfferIds: string[];
  /** 累計加購金額（minor）。 */
  upsellTotalMinor: number;
  /** 是否已完成 funnel（走到感謝頁）。 */
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** funnel 下一步。 */
export type UpsellStep =
  | { kind: 'offer'; offer: UpsellOffer; index: number; total: number }
  | { kind: 'thank-you'; slug: string };

/** 每層 OTO 統計（後台分析）。 */
export interface UpsellOfferStats {
  offerId: string;
  views: number;
  accepts: number;
  skips: number;
  /** accepts / views。 */
  acceptRate: number;
}
