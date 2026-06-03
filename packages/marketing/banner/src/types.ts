/** Banner 位置（首頁 / LP / 結帳前等）。 */
export type BannerSlot = 'home-hero' | 'home-secondary' | 'category-top' | 'checkout' | string;

/** 一張 banner 設定。 */
export interface Banner {
  id: string;
  tenantId: string;
  slot: BannerSlot;
  /** 顯示文字（中文）。 */
  title: string;
  /** 圖片 URL。 */
  imageUrl: string;
  /** 點擊導向。 */
  linkUrl: string;
  /** 起訖時間（含日內時段限制）。 */
  startAt: Date;
  endAt: Date;
  /** 日內生效時段（HH:mm 24h），可選。例：{ from: '09:00', to: '21:00' }。 */
  dayWindow?: { from: string; to: string };
  /** A/B 測試組標籤；同 slot 同 group 互相 PK，無 group 視為獨立 variant。 */
  experimentGroup?: string;
  /** 同組權重（0-100）。 */
  weight: number;
  status: 'scheduled' | 'active' | 'ended' | 'paused';
  createdAt: Date;
}

/** 曝光紀錄。 */
export interface BannerImpression {
  bannerId: string;
  tenantId: string;
  at: Date;
  /** 訪客唯一識別（cookie / device id）。 */
  visitorId?: string;
}

/** 點擊紀錄。 */
export interface BannerClick {
  bannerId: string;
  tenantId: string;
  at: Date;
  visitorId?: string;
}

/** 統計報表。 */
export interface BannerStats {
  bannerId: string;
  impressions: number;
  clicks: number;
  /** clicks / impressions，可為 0。 */
  ctr: number;
}
