/**
 * 訂單模組型別（goal 03 §7）。
 *
 * Lock：ADR-0011 §03-07 v1。
 */

/**
 * 訂單狀態。
 *
 * 流程：
 * ```
 * draft → pending-payment → paid → preparing → shipped → delivered → completed
 *                                          ↘ refund-requested → refunded
 *                                          ↘ cancelled
 * ```
 */
export type OrderStatus =
  | 'draft'
  | 'pending-payment'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'refund-requested'
  | 'refunded'
  | 'cancelled';

/**
 * 訂單項目（下單時 snapshot，避免商品改名 / 改價影響舊單）。
 */
export interface OrderItem {
  productId: string;
  variantId: string;
  sku: string;
  /** 下單時商品名稱快照。 */
  title: string;
  unitPrice: number;
  quantity: number;
  /** 規格快照，例如 { color: '紅', size: 'L' }。 */
  optionValues?: Record<string, string>;
  /** 已分攤折扣金額（discount-engine 寫入）。 */
  allocatedDiscount?: number;
  /** 圖片 URL 快照（信件 / 後台縮圖用）。 */
  thumbnailUrl?: string;
}

/**
 * 訂單。
 */
export interface Order {
  id: string;
  tenantId: string;
  /** 訂單編號（顯示用，TW 慣例：YYYYMMDD-NNNN）。 */
  orderNumber: string;
  /** 已登入時 userId，訪客結帳為 null。 */
  userId: string | null;
  /** 訪客 email（聯絡 + 一鍵成為會員）。 */
  guestEmail?: string;
  /** 訪客手機。 */
  guestPhone?: string;
  status: OrderStatus;
  items: OrderItem[];
  currency: string;
  /** 小計（未含折扣 / 運費 / 稅）。 */
  subtotal: number;
  /** 折扣總額。 */
  discountTotal: number;
  /** 運費。 */
  shippingFee: number;
  /** 稅額。 */
  taxAmount: number;
  /** 訂單總額。 */
  total: number;
  /** 行銷同意。 */
  marketingOptIn: boolean;
  /** 訂單備註（客戶填）。 */
  note?: string;
  /** 後台備註（管理員填）。 */
  internalNote?: string;
  /** 拆單 / 合單關聯：父訂單 id。 */
  parentOrderId?: string;
  /** 拆單 / 合單關聯：子訂單 id list。 */
  childOrderIds?: string[];
  /** 是否為預購單。 */
  isPreOrder: boolean;
  /** 付款 provider（newebpay / ecpay / stripe ...）。 */
  paymentProvider?: string;
  /** 物流 provider。 */
  shippingProvider?: string;
  /** 物流追蹤號。 */
  trackingNumber?: string;
  /** 發票 id（goal 02）。 */
  invoiceId?: string;
  /** 狀態異動時間 timeline，方便 audit。 */
  statusHistory: Array<{ from: OrderStatus | null; to: OrderStatus; at: string }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 訂單編號產生選項。
 */
export interface OrderNumberOptions {
  /** 流水號 padding 長度，預設 4（0001）。 */
  padLength?: number;
  /** 取得日期函數（測試可注入）。 */
  now?: () => Date;
  /**
   * 隨機後綴長度（預設 4）。讓訂單編號不可被線性枚舉，
   * 避免他人從收據網址 / 發票查詢頁猜測其他客戶訂單。
   * 設為 0 可關閉（測試 / 既有資料相容）。
   */
  randomSuffixLength?: number;
}
