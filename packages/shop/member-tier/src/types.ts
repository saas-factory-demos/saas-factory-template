/**
 * 會員等級型別（goal 03 §8）。
 */

/**
 * 等級升降條件來源。
 */
export type TierConditionType =
  | { type: 'total_spend'; amount: number; windowDays?: number }
  | { type: 'order_count'; count: number; windowDays?: number }
  | { type: 'custom'; key: string; value: unknown };

/**
 * 會員等級設定。
 */
export interface MemberTier {
  id: string;
  tenantId: string;
  name: string;
  /** 等級排序，越大越高階。 */
  rank: number;
  /** 進入此等級的條件（AND，全 true 才升）。 */
  conditions: TierConditionType[];
  /** 該等級享有的折扣百分比（0-100）。 */
  discountPercentage?: number;
  /** 點數倍率（1.0 為正常，1.5 = 1.5 倍）。 */
  pointsMultiplier?: number;
  /** 免運門檻（覆蓋預設）。 */
  freeShippingThreshold?: number;
  /** 等級異動是否通知。 */
  notifyOnChange: boolean;
  active: boolean;
}

/**
 * 會員等級狀態（每使用者一筆）。
 */
export interface MemberTierStatus {
  userId: string;
  tenantId: string;
  /** 目前等級 id。 */
  tierId: string | null;
  /** 進入此等級的時間。 */
  enteredAt: string;
  /** 下次年度檢核日期。 */
  nextReviewAt: string;
  /** 累計消費（用來判定升級）。 */
  totalSpend: number;
  /** 訂單數。 */
  orderCount: number;
}

/**
 * 評估上下文。
 */
export interface TierEvaluationContext {
  userId: string;
  tenantId: string;
  /** 累計消費（依 windowDays 範圍）。 */
  totalSpend: number;
  /** 累計訂單數（依 windowDays 範圍）。 */
  orderCount: number;
  /** 自訂條件值。 */
  customValues?: Record<string, unknown>;
  now?: Date;
}

/**
 * 評估結果。
 */
export interface TierEvaluationResult {
  /** 評估後應有的等級 id（最高匹配）。 */
  resolvedTierId: string | null;
  /** 是否與現狀不同。 */
  changed: boolean;
  reason: 'upgrade' | 'downgrade' | 'unchanged' | 'manual';
}

/**
 * 儲存層介面。
 */
export interface MemberTierStore {
  listTiers(tenantId: string): Promise<MemberTier[]>;
  getStatus(userId: string, tenantId: string): Promise<MemberTierStatus | null>;
  saveStatus(status: MemberTierStatus): Promise<void>;
}
