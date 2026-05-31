/** 折扣型態（與 coupons 同步定義以避免循環依賴）。 */
export type FlashDiscount =
  | { kind: 'percent'; rate: number }
  | { kind: 'fixed'; amountMinor: number };

/** 階段門檻：達加購數後解鎖更深折扣。 */
export interface ThresholdTier {
  /** 達此加購人數 / 數量後啟動。 */
  minCount: number;
  discount: FlashDiscount;
}

/** Flash sale 活動。 */
export interface FlashSale {
  id: string;
  tenantId: string;
  name: string;
  /** 套用範圍：全館 / 特定商品 / 特定分類。 */
  scope:
    | { kind: 'all' }
    | { kind: 'products'; productIds: string[] }
    | { kind: 'categories'; categoryIds: string[] };
  /** 預設折扣（未達門檻前的折扣）。 */
  baseDiscount: FlashDiscount;
  /** 階段門檻（人數遞增 → 折扣遞深）。 */
  tiers: ThresholdTier[];
  startAt: Date;
  endAt: Date;
  status: 'scheduled' | 'active' | 'ended';
  /** 已加購數（達門檻判斷用）。 */
  addToCartCount: number;
  createdAt: Date;
}

/** 倒數狀態（給前台 banner 用）。 */
export interface CountdownState {
  saleId: string;
  status: 'scheduled' | 'active' | 'ended';
  /** 倒數至 active（scheduled 階段）或 倒數至 end（active 階段）。 */
  countsDownTo: Date;
  /** 目前生效的折扣。 */
  currentDiscount: FlashDiscount;
  /** 下一個尚未達成的階段。 */
  nextTier?: ThresholdTier;
  addToCartCount: number;
}
