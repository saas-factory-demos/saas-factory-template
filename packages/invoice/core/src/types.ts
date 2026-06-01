/**
 * 發票模組核心型別（goal 02 接收所有權）。
 *
 * 後續 goal 03 / 04 / 05 只 consume，不再擴 schema。
 */

/** 載具類型（台灣電子發票規格） */
export type InvoiceCarrierType =
  | 'mobile-barcode' // 手機條碼（/開頭 8 碼）
  | 'natural-person-cert' // 自然人憑證（NN12345678 16 碼）
  | 'company-tax-id' // 公司統編
  | 'donation' // 捐贈（NPOBAN 3-7 碼）
  | 'member' // 會員載具（自家系統）
  | 'paper'; // 印紙本

export interface InvoiceCarrier {
  type: InvoiceCarrierType;
  /** mobile-barcode / natural-person-cert / company-tax-id 等的值 */
  value?: string;
  /** donation 時填 NPO 愛心碼 */
  donationCode?: string;
}

/** B2C 個人 / B2B 公司 */
export type InvoiceCategory = 'B2C' | 'B2B';

/** 三種開立模式 */
export type InvoiceIssueMode =
  | 'immediate' // 即時開立（結帳付款後馬上開）
  | 'on-trigger' // 觸發開立（出貨完成、退費期過等）
  | 'scheduled'; // 預約開立（指定日期）

/** 課稅別 */
export type InvoiceTaxType = 'taxable' | 'zero-tax' | 'tax-free' | 'mixed';

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number; // 含稅單價（分為單位）
  unit?: string;
  /** 商品稅別（mixed 課稅別時必填） */
  taxType?: InvoiceTaxType;
  /** 商品分類（會計報表用） */
  category?: string;
}

export interface IssueInvoiceParams {
  orderId: string;
  tenantId: string;
  category: InvoiceCategory;
  carrier: InvoiceCarrier;
  /** B2B 時：買受人公司名稱 */
  buyerName?: string;
  /** B2B 時：買受人地址 */
  buyerAddress?: string;
  /** B2B 時：統一編號 */
  buyerTaxId?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  items: InvoiceItem[];
  taxType?: InvoiceTaxType;
  /** 總金額（含稅、分為單位） */
  totalAmount: number;
  /** 稅金（分為單位） */
  taxAmount?: number;
  /** 折扣金額（分為單位） */
  discountAmount?: number;
  issueMode?: InvoiceIssueMode;
  /** scheduled 時：預約開立時間 */
  scheduledAt?: string;
}

export interface IssueAllowanceParams {
  invoiceId: string;
  tenantId: string;
  /** 折讓品項（可只折部分） */
  items: InvoiceItem[];
  /** 折讓總額（分為單位） */
  amount: number;
  taxAmount?: number;
  reason?: string;
}

export interface VoidInvoiceParams {
  invoiceId: string;
  tenantId: string;
  reason: string;
}

/** Provider 統一介面 */
export interface InvoiceProvider {
  readonly name: 'ezpay' | 'ecpay-invoice';
  issue(params: IssueInvoiceParams): Promise<InvoiceResult>;
  issueAllowance(params: IssueAllowanceParams): Promise<AllowanceResult>;
  void(params: VoidInvoiceParams): Promise<void>;
  query(invoiceNumber: string): Promise<InvoiceResult | null>;
}

export interface InvoiceResult {
  invoiceId: string;
  invoiceNumber: string;
  issuedAt: string;
  status: 'issued' | 'voided' | 'pending';
  totalAmount: number;
  raw: Record<string, unknown>;
}

export interface AllowanceResult {
  allowanceId: string;
  allowanceNumber: string;
  invoiceId: string;
  amount: number;
  status: 'issued' | 'failed';
  raw: Record<string, unknown>;
}
