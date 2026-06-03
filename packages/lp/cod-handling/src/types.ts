/** COD 訂單狀態。 */
export type CodStatus =
  | 'pending-confirm' // 等客服電聯確認
  | 'confirmed' // 客服確認 OK，準備出貨
  | 'shipped' // 已出貨
  | 'delivered' // 已送達且收款
  | 'rejected' // 拒收
  | 'cancelled'; // 客服取消（電話打不通 / 客戶取消）

/** 物流通路。 */
export type CodChannel = 'convenience-store' | 'home-delivery';

/** 客服跟催狀態（pending-confirm 階段用）。 */
export type FollowUpStage =
  | 'queued' // 排程中
  | 'attempted' // 已嘗試聯絡
  | 'unreachable' // 多次無人接
  | 'confirmed'
  | 'cancelled';

/** COD 訂單。 */
export interface CodOrder {
  id: string;
  tenantId: string;
  pageId: string;
  /** 對應 lp-checkout-form 建立的 OrderDraft id。 */
  draftId: string;
  customer: { name: string; phone: string; email?: string };
  channel: CodChannel;
  totalMinor: number;
  status: CodStatus;
  followUp: FollowUpStage;
  /** 嘗試聯絡次數。 */
  attempts: number;
  /** 上次跟催時間。 */
  lastAttemptAt?: Date;
  /** 拒收原因（rejected 時填）。 */
  rejectReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** 拒收率統計。 */
export interface RejectionStats {
  /** 統計範圍內總配達筆數（delivered + rejected）。 */
  totalDeliveryAttempted: number;
  /** 拒收筆數。 */
  rejectedCount: number;
  /** rejectedCount / totalDeliveryAttempted。 */
  rejectionRate: number;
}

/** 黑名單客戶（拒收太多次）。 */
export interface CodBlacklistEntry {
  tenantId: string;
  phone: string;
  /** 累積拒收次數。 */
  rejectionCount: number;
  /** 黑名單建立時間（達門檻時寫入）。 */
  blacklistedAt: Date;
  /** 拒收紀錄。 */
  history: Array<{ orderId: string; reason?: string; at: Date }>;
}
