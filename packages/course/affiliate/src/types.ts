/** 分潤對象角色。 */
export type PayeeRole = 'platform' | 'instructor' | 'affiliate-l1' | 'affiliate-l2';

/** 分潤規則設定（每個課程或全域可有不同設定）。 */
export interface CommissionPolicy {
  id: string;
  tenantId: string;
  /** 適用範圍：'course' 限定該 courseId，'tenant' 為全租戶預設。 */
  scope: 'course' | 'tenant';
  courseId?: string;
  /** 平台抽成（0~1）。 */
  platformRate: number;
  /** 講師分潤（0~1）。 */
  instructorRate: number;
  /** L1 affiliate（直接推薦人）分潤。 */
  affiliateL1Rate: number;
  /**
   * L2 affiliate（推薦人的推薦人）分潤，預設 0 以避免傳銷風險。
   *
   * 開啟前請確認當地法規（台灣多層次傳銷管理法）。
   */
  affiliateL2Rate: number;
  /**
   * 結算保留天數（hold period）：退費鑑賞期過後才釋放佣金。預設 14 天。
   */
  holdDays: number;
}

/** Affiliate 推薦人。 */
export interface Affiliate {
  id: string;
  tenantId: string;
  userId: string;
  /** Affiliate 代碼（網址帶 ?ref=xxx 用）。 */
  code: string;
  /** 推薦人的 affiliateId（多層用）。 */
  referredByAffiliateId?: string;
  /** 是否啟用。 */
  active: boolean;
  createdAt: Date;
}

/** 訂單追蹤：哪一筆訂單由哪個 affiliate 帶進來。 */
export interface OrderAttribution {
  orderId: string;
  tenantId: string;
  /** L1 推薦人（直接帶進來的）。 */
  l1AffiliateId?: string;
  /** L2 推薦人（自動由 L1.referredByAffiliateId 取得）。 */
  l2AffiliateId?: string;
  attributedAt: Date;
}

/** 分潤帳目（每筆訂單拆成多個 entry）。 */
export interface CommissionLedgerEntry {
  id: string;
  tenantId: string;
  orderId: string;
  courseId: string;
  payeeRole: PayeeRole;
  /** 收益對象 user/instructor/affiliate id，平台用 'platform'。 */
  payeeId: string;
  /** 金額（最小幣別單位）。 */
  amountMinor: number;
  /** 狀態：hold 中 / 可提領 / 已退款抵銷。 */
  status: 'held' | 'available' | 'reversed';
  /** 訂單成立時間（用來算 hold 釋放日）。 */
  orderedAt: Date;
  /** 釋放可提領的時間 = orderedAt + holdDays。 */
  releasesAt: Date;
}

/** 月結 payout 摘要。 */
export interface MonthlyPayoutSummary {
  tenantId: string;
  payeeId: string;
  payeeRole: PayeeRole;
  month: string;
  /** 此月應結金額（available 狀態的 sum）。 */
  amountMinor: number;
  entryIds: string[];
}

/** Affiliate store 介面。 */
export interface AffiliateStore {
  upsertPolicy(p: CommissionPolicy): Promise<void>;
  findPolicy(tenantId: string, courseId: string): Promise<CommissionPolicy | undefined>;
  upsertAffiliate(a: Affiliate): Promise<void>;
  getAffiliate(id: string): Promise<Affiliate | undefined>;
  findAffiliateByCode(tenantId: string, code: string): Promise<Affiliate | undefined>;
  upsertAttribution(a: OrderAttribution): Promise<void>;
  getAttribution(orderId: string): Promise<OrderAttribution | undefined>;
  appendLedger(entry: CommissionLedgerEntry): Promise<void>;
  listLedgerByOrder(orderId: string): Promise<CommissionLedgerEntry[]>;
  listLedgerByPayee(payeeId: string): Promise<CommissionLedgerEntry[]>;
  updateLedgerStatus(id: string, status: CommissionLedgerEntry['status']): Promise<void>;
}
