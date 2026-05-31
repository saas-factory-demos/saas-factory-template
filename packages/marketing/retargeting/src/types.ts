/** 客戶生命週期分類。 */
export type LifecycleStage =
  | 'new' // 30 天內首購
  | 'active' // 90 天內有訂單
  | 'at-risk' // 90-180 天無訂單
  | 'dormant' // 180-365 天無訂單
  | 'lost' // 365+ 天無訂單
  | 'never-purchased'; // 從未下單

/** 客戶活動快照（給 lifecycle 計算用）。 */
export interface CustomerActivity {
  tenantId: string;
  customerId: string;
  firstPurchaseAt?: Date;
  lastPurchaseAt?: Date;
  totalOrders: number;
  totalSpentMinor: number;
}

/** 客戶 lifecycle 紀錄（被 classify 後寫入）。 */
export interface CustomerLifecycle {
  tenantId: string;
  customerId: string;
  stage: LifecycleStage;
  /** 上次評估時間。 */
  evaluatedAt: Date;
  /** 上次階段（為了偵測 transition 觸發事件）。 */
  previousStage?: LifecycleStage;
}

/** 商品瀏覽紀錄。 */
export interface ProductView {
  id: string;
  tenantId: string;
  customerId: string;
  productId: string;
  at: Date;
  /** 來源：商品頁 / 推薦區 / 搜尋。 */
  source?: string;
}

/** Retargeting 行動分類。 */
export type RetargetAction =
  | 'viewed-not-added' // 看過商品但未加購
  | 'added-not-checkout' // 加購但未結帳（走 abandoned-cart）
  | 'purchased-cross-sell' // 結帳完成 → 7 天後相關商品
  | 'win-back-30d' // 30 天未回購
  | 'win-back-90d'; // 90 天未回購

/** Retargeting 排程任務。 */
export interface RetargetTask {
  id: string;
  tenantId: string;
  customerId: string;
  action: RetargetAction;
  /** 關聯資料（商品 id 或訂單 id 等）。 */
  refId?: string;
  scheduledAt: Date;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
