/** 團購 deal。 */
export interface GroupBuyDeal {
  id: string;
  tenantId: string;
  productId: string;
  name: string;
  /** 成團門檻人數。 */
  minMembers: number;
  /** 上限（可不設）。 */
  maxMembers?: number;
  /** 一份的售價（minor）。 */
  unitPriceMinor: number;
  /** 報名截止時間（過了還沒成團就退款）。 */
  deadlineAt: Date;
  /** 成團後的 LINE 群連結（可選，後台設）。 */
  lineGroupUrl?: string;
  status: 'open' | 'succeeded' | 'failed' | 'cancelled';
  /** 成團時間。 */
  succeededAt?: Date;
  /** 結算時間（失敗或成功）。 */
  settledAt?: Date;
  createdAt: Date;
}

/** 團員報名紀錄。 */
export interface GroupBuyOrder {
  id: string;
  tenantId: string;
  dealId: string;
  customerId: string;
  /** 上游金流訂單 id（用於退款 webhook）。 */
  paymentOrderId: string;
  amountMinor: number;
  status: 'pending' | 'confirmed' | 'refunded' | 'cancelled';
  joinedAt: Date;
}

/** 結算結果。 */
export interface SettlementResult {
  deal: GroupBuyDeal;
  /** 成團 → 'succeeded' / 'failed'。 */
  outcome: 'succeeded' | 'failed';
  totalMembers: number;
  refundedOrderIds: string[];
}
