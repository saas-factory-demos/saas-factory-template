/**
 * 退換貨型別（goal 03 §13）。
 */

/**
 * 申請類型。
 */
export type ReturnKind = 'refund' | 'exchange';

/**
 * 退貨原因（統計用）。
 */
export type ReturnReason =
  | 'defective'
  | 'wrong-item'
  | 'size-fit'
  | 'no-longer-needed'
  | 'damaged-in-transit'
  | 'other';

/**
 * 退貨運費由誰負擔。
 */
export type ShippingFeePayer = 'merchant' | 'customer';

/**
 * 退貨狀態。
 */
export type ReturnStatus =
  | 'pending' // 申請中（待商家審核）
  | 'approved' // 已核可（等顧客寄回）
  | 'received' // 商家已收到退貨
  | 'refunded' // 已退款（含發票折讓）
  | 'exchanged' // 已換貨（新單已建立）
  | 'rejected' // 拒絕
  | 'cancelled'; // 顧客自行取消

/**
 * 退貨項目（針對部分退款）。
 */
export interface ReturnItem {
  variantId: string;
  productId: string;
  quantity: number;
  /** 該品單價（原訂單 snapshot）。 */
  unitPrice: number;
  /** 該品實付（已扣分攤折扣）。 */
  paidAmount: number;
}

/**
 * 退換貨申請。
 */
export interface ReturnRequest {
  id: string;
  tenantId: string;
  /** 原訂單 id。 */
  orderId: string;
  /** 換貨時的新訂單 id。 */
  exchangeOrderId?: string;
  userId: string | null;
  kind: ReturnKind;
  reason: ReturnReason;
  /** 顧客填寫的補充描述。 */
  reasonDetail?: string;
  items: ReturnItem[];
  /** 退款金額（部分退款時 < 訂單總額）。 */
  refundAmount: number;
  /** 運費由誰負擔。 */
  shippingFeePayer: ShippingFeePayer;
  status: ReturnStatus;
  /** 7 天鑑賞期合規檢查通過。 */
  withinCoolingPeriod: boolean;
  /** 對應發票折讓 id（呼叫 invoice.issueAllowance 後寫入）。 */
  allowanceId?: string;
  statusHistory: Array<{ from: ReturnStatus | null; to: ReturnStatus; at: string }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 申請建立輸入。
 */
export interface CreateReturnInput {
  tenantId: string;
  orderId: string;
  userId: string | null;
  kind: ReturnKind;
  reason: ReturnReason;
  reasonDetail?: string;
  items: ReturnItem[];
  refundAmount: number;
  shippingFeePayer: ShippingFeePayer;
  /** 原訂單送達時間，用於計算 7 天鑑賞期。 */
  orderDeliveredAt: Date | null;
}

/**
 * 儲存層介面。
 */
export interface ReturnStore {
  get(id: string): Promise<ReturnRequest | null>;
  save(request: ReturnRequest): Promise<void>;
  listByOrder(orderId: string): Promise<ReturnRequest[]>;
}

/**
 * 發票折讓串接介面（指向 goal 02 invoice-core.issueAllowance）。
 */
export interface InvoiceAllowanceIssuer {
  issueAllowance(input: {
    invoiceId: string;
    amount: number;
    reason?: string;
  }): Promise<{ allowanceId: string }>;
}
