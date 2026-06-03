/**
 * 點數系統型別（goal 03 §9）。
 */

/**
 * 點數批次（FIFO 用，最早到期的先扣）。
 */
export interface PointsBatch {
  id: string;
  userId: string;
  tenantId: string;
  /** 該批次發放點數。 */
  amount: number;
  /** 已扣除（含 redeem + expire）。 */
  consumed: number;
  /** 取得時間。 */
  earnedAt: string;
  /** 到期時間（null 為永不過期）。 */
  expiresAt: string | null;
  /** 來源。 */
  source: 'order' | 'manual' | 'campaign';
  sourceId?: string;
  /** 過期標記。 */
  expired: boolean;
}

/**
 * 點數異動歷史（每次 earn / redeem / expire / manual 寫一筆）。
 */
export interface PointsLedger {
  id: string;
  userId: string;
  tenantId: string;
  /** + 為加點，- 為扣點。 */
  delta: number;
  /** 異動類型。 */
  kind: 'earn' | 'redeem' | 'expire' | 'manual-add' | 'manual-deduct';
  /** 異動後餘額（方便對帳）。 */
  balanceAfter: number;
  /** 關聯訂單或操作者。 */
  orderId?: string;
  operatorUserId?: string;
  reason?: string;
  createdAt: string;
}

/**
 * 賺點規則（消費 X 元 = Y 點）。
 */
export interface PointsEarnRule {
  /** 多少元換 1 點。 */
  spendPerPoint: number;
  /** 倍率（會員等級調整時用）。 */
  multiplier?: number;
  /** 點數有效天數（null 為永不過期）。 */
  expiryDays: number | null;
}

/**
 * 用點規則（X 點 = Y 元）。
 */
export interface PointsRedeemRule {
  /** X 點折抵 1 元。 */
  pointsPerCurrency: number;
  /** 單筆最高可折金額（避免一次燒光，可選）。 */
  maxRedeemAmount?: number;
}

/**
 * 儲存層介面。
 */
export interface PointsStore {
  /** 取得使用者所有未耗盡且未過期的批次（依 earnedAt 升冪）。 */
  listActiveBatches(userId: string, tenantId: string, now: Date): Promise<PointsBatch[]>;
  /** 取得所有未過期批次（含已耗盡，用於 audit）。 */
  listAllBatches(userId: string, tenantId: string): Promise<PointsBatch[]>;
  saveBatch(batch: PointsBatch): Promise<void>;
  updateBatch(batch: PointsBatch): Promise<void>;
  appendLedger(entry: PointsLedger): Promise<void>;
}
