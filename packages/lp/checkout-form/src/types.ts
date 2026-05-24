/** 付款方式。 */
export type PaymentMethod = 'credit-card' | 'cod' | 'line-pay' | 'jko-pay';

/** 發票類型（台灣）。 */
export type InvoiceType = 'individual' | 'donation' | 'company';

/** LP 表單方案（顯示在三段式 UI）。 */
export interface LpPlan {
  id: string;
  title: string;
  priceMinor: number;
  comparePriceMinor?: number;
}

/** Order Bump 商品定義（送出前的勾選加購）。 */
export interface OrderBump {
  productId: string;
  title: string;
  priceMinor: number;
}

/** 表單發票資訊。 */
export interface InvoiceInfo {
  type: InvoiceType;
  /** 統編（company）或愛心碼（donation）。 */
  code?: string;
  /** 抬頭。 */
  title?: string;
}

/** 客戶聯絡資訊。 */
export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

/** 收件地址（COD 必填，信用卡可選）。 */
export interface ShippingAddress {
  zip: string;
  city: string;
  district: string;
  street: string;
}

/** LP 提交 payload（前端表單送上來的原始資料）。 */
export interface LpFormPayload {
  tenantId: string;
  pageId: string;
  planId: string;
  paymentMethod: PaymentMethod;
  customer: CustomerInfo;
  shipping?: ShippingAddress;
  invoice?: InvoiceInfo;
  /** 是否加購 Order Bump。 */
  orderBumpAccepted?: boolean;
  /** 優惠碼。 */
  couponCode?: string;
  /** OTP 驗證碼（若該 tenant 啟用 OTP）。 */
  otpCode?: string;
}

/** 訂單草稿（建單後傳給 upsell-funnel 接力）。 */
export interface OrderDraft {
  id: string;
  tenantId: string;
  pageId: string;
  customer: CustomerInfo;
  shipping?: ShippingAddress;
  invoice?: InvoiceInfo;
  items: Array<{ productId: string; title: string; priceMinor: number }>;
  totalMinor: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'paid' | 'failed';
  createdAt: Date;
  /** 是否已留存付款憑證，可用於 Upsell 一鍵加購。 */
  hasStoredPayment: boolean;
}

/** OTP 紀錄（行動電話驗證）。 */
export interface OtpRecord {
  tenantId: string;
  phone: string;
  code: string;
  expiresAt: Date;
  consumedAt?: Date;
}
