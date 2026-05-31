/** 聯盟夥伴（推薦人）。 */
export interface Affiliate {
  id: string;
  tenantId: string;
  /** 對應的客戶 id（可選，匿名 affiliate 也允許）。 */
  customerId?: string;
  /** 推薦碼（短碼）。 */
  code: string;
  status: 'active' | 'suspended';
  createdAt: Date;
  /** 上層推薦人（多層分潤用）。 */
  parentAffiliateId?: string;
}

/** 分潤規則。 */
export interface CommissionPolicy {
  /** 第一層比例（0-1）。例：0.1 = 10%。 */
  level1Rate: number;
  /** 第二層比例（若啟用多層）。 */
  level2Rate?: number;
  /** 是否啟用多層。 */
  multiLevelEnabled: boolean;
  /** 結算等待天數（退費期過才轉 approved）。 */
  holdDays: number;
  /** 同人偵測：同一 ip 在 N 分鐘內自推自買視為作弊。 */
  selfReferralWindowMinutes: number;
}

/** 訂單來源紀錄（聯盟歸因）。 */
export interface AffiliateAttribution {
  orderId: string;
  tenantId: string;
  affiliateId: string;
  /** 訂單金額。 */
  orderAmountMinor: number;
  /** 客戶 id（若有）。 */
  customerId?: string;
  /** 訂單 ip（防作弊用）。 */
  ip?: string;
  at: Date;
}

/** 分潤明細。 */
export interface Commission {
  id: string;
  tenantId: string;
  affiliateId: string;
  orderId: string;
  level: 1 | 2;
  amountMinor: number;
  /** pending：等退費期；approved：可提領；clawback：退費扣回；void：作弊作廢。 */
  status: 'pending' | 'approved' | 'clawback' | 'void';
  createdAt: Date;
  /** 等到此日期才會被 approve。 */
  releaseAt: Date;
  /** 結算單 id（已結算才有）。 */
  payoutId?: string;
}

/** 提領結算單。 */
export interface Payout {
  id: string;
  tenantId: string;
  affiliateId: string;
  /** 年月，如 2026-05。 */
  periodYearMonth: string;
  totalAmountMinor: number;
  status: 'draft' | 'requested' | 'paid';
  createdAt: Date;
  paidAt?: Date;
}

/** 推薦人 dashboard 統計。 */
export interface AffiliateStats {
  affiliateId: string;
  totalOrders: number;
  totalRevenueMinor: number;
  pendingCommissionMinor: number;
  approvedCommissionMinor: number;
  paidCommissionMinor: number;
}
