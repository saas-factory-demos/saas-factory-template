/** 跟催通路。 */
export type RecoveryChannel = 'email' | 'line' | 'sms';

/** 跟催結果（給統計用）。 */
export type SendOutcome = 'sent' | 'opened' | 'clicked' | 'converted' | 'failed';

/** 單一段的跟催設定。 */
export interface RecoveryStage {
  /** 從 cart 棄單時間起算多少 ms 後發送。 */
  delayMs: number;
  /** 通路（可多選；同段同時發 Email + LINE）。 */
  channels: RecoveryChannel[];
  /** 文案 / 模板 id。 */
  templateId: string;
  /** 折扣碼（可選；後台可設）。 */
  couponCode?: string;
  /** 此段觸發的條件門檻：訂單金額（minor）下限。 */
  minOrderMinor?: number;
}

/** 棄單跟催流程設定。 */
export interface RecoveryFlowConfig {
  /** 30 分鐘無更新視為 abandoned（預設值）。 */
  abandonAfterMs: number;
  /** 跟催段（順序敏感）。 */
  stages: RecoveryStage[];
  /** 同客戶每月最多領幾次棄單折扣（防作弊）。 */
  maxDiscountPerCustomerPerMonth?: number;
}

/** 購物車快照（abandoned-cart 不持有 cart 本體，由上游帶入）。 */
export interface CartSnapshot {
  cartId: string;
  tenantId: string;
  customerId: string;
  customerEmail?: string;
  customerLine?: string;
  customerPhone?: string;
  totalMinor: number;
  itemCount: number;
  /** 最近一次活動時間（用來判斷 abandoned）。 */
  lastActivityAt: Date;
}

/** 單一跟催發送任務（每 stage 一筆，每 channel 一筆？這裡採每 stage 一筆，channel 在 send 時 fan-out）。 */
export interface RecoveryAttempt {
  id: string;
  tenantId: string;
  cartId: string;
  customerId: string;
  stageIndex: number;
  scheduledAt: Date;
  status: 'pending' | 'sent' | 'skipped' | 'failed';
  /** 對每個 channel 的結果。 */
  results: Array<{ channel: RecoveryChannel; outcome: SendOutcome; at: Date; reason?: string }>;
  /** Cart 在排程當下的快照（避免之後 cart 被刪後無法發送）。 */
  cartSnapshot: CartSnapshot;
  createdAt: Date;
  updatedAt: Date;
}

/** 客戶領取棄單折扣紀錄（給防作弊 quota 用）。 */
export interface CouponClaim {
  tenantId: string;
  customerId: string;
  attemptId: string;
  couponCode: string;
  at: Date;
}

/** 通路 sender hook（外部 email / LINE / SMS 注入）。 */
export interface ChannelSender {
  send(channel: RecoveryChannel, snapshot: CartSnapshot, payload: { templateId: string; couponCode?: string }): Promise<{ ok: boolean; reason?: string }>;
}

/** 漏斗指標。 */
export interface RecoveryFunnelStats {
  scheduled: number;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  /** clicked / sent。 */
  clickRate: number;
  /** converted / sent。 */
  conversionRate: number;
  /** 帶來的營收（converted 對應的 cart 金額加總）。 */
  recoveredRevenueMinor: number;
}
