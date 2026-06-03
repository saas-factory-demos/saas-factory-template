/**
 * 結帳模組型別（goal 03 §4）。
 */

import type { DiscountResult, DiscountRule } from '@saas-factory/shop-discount-engine';
import type { Order, OrderItem } from '@saas-factory/shop-orders';

/**
 * 收件人資訊。
 */
export interface Recipient {
  name: string;
  phone: string;
  /** 訪客 email；登入會員以 userId 為主。 */
  email: string;
  /** 地址（宅配 / 國際 / 自取均共用）。 */
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

/**
 * 配送選擇。
 */
export interface ShippingChoice {
  /** 配送方式 id（home / cvs / pickup / international ...）。 */
  methodId: string;
  /** 計算後運費。 */
  fee: number;
  /** 超商門市 id（CVS 才用）。 */
  cvsStoreId?: string;
}

/**
 * 付款選擇。
 */
export interface PaymentChoice {
  /** 付款方式 id（credit-card / linepay / atm / cvs ...）。 */
  methodId: string;
  /** provider 名稱（newebpay / ecpay / stripe ...）。 */
  provider: string;
  /** 信用卡分期期數。 */
  installments?: number;
}

/**
 * 發票資訊（轉為 invoice-core 的 IssueRequest）。
 */
export interface InvoiceChoice {
  /** 發票類型。 */
  carrierType: 'cloud' | 'mobile-barcode' | 'natural-person' | 'paper' | 'company' | 'donation';
  /** 載具號碼（mobile-barcode / natural-person 用）。 */
  carrierId?: string;
  /** 公司統一編號（company 用）。 */
  taxId?: string;
  /** 公司抬頭。 */
  companyTitle?: string;
  /** 捐贈碼。 */
  donationCode?: string;
}

/**
 * 結帳輸入。
 */
export interface CheckoutInput {
  tenantId: string;
  /** 已登入時 userId，訪客結帳為 null。 */
  userId: string | null;
  cartId: string;
  recipient: Recipient;
  shipping: ShippingChoice;
  payment: PaymentChoice;
  invoice: InvoiceChoice;
  /** 額外手動輸入的 coupon code。 */
  couponCode?: string;
  /** 訂單備註。 */
  note?: string;
  /** 行銷同意。 */
  marketingOptIn: boolean;
  /** 同意條款（必須 true）。 */
  agreedToTerms: boolean;
  /** 結帳時的客戶資料（餵給 discount-engine 條件評估）。 */
  customer?: {
    isFirstPurchase?: boolean;
    memberTier?: string;
    customerTags?: string[];
    birthdayMonth?: number;
  };
  /** 站別（影響 site_type 條件）。 */
  siteType?: string;
}

/**
 * 取得規則回傳。除了規則本身，附帶該客戶針對每條規則的使用次數，
 * 讓 discount-engine 評估 `maxUsesPerUser` 時不會所有規則共用同一個 counter。
 */
export interface CheckoutRulesResult {
  rules: DiscountRule[];
  /** key 為 DiscountRule.id，value 為該客戶歷史用過的次數。可省略視為 0。 */
  customerUsageCounts?: Record<string, number>;
}

/**
 * 試算回傳（給結帳頁右側即時顯示）。
 */
export interface CheckoutQuote {
  items: OrderItem[];
  subtotal: number;
  discounts: DiscountResult[];
  discountTotal: number;
  shippingFee: number;
  shippingDiscount: number;
  taxAmount: number;
  total: number;
}

/**
 * 結帳結果。
 */
export interface CheckoutResult {
  order: Order;
  /** 金流 redirect URL 或 inline form payload（由 PaymentInitiator 提供）。 */
  paymentRedirect?: string;
  paymentPayload?: Record<string, unknown>;
}

/**
 * 運費計算介面（留接口給 shipping-providers 真實接）。
 */
export interface ShippingCalculator {
  calculate(input: {
    tenantId: string;
    methodId: string;
    subtotal: number;
    weightGrams?: number;
    destinationCountry?: string;
  }): Promise<number>;
}

/**
 * 稅額計算介面。
 */
export interface TaxCalculator {
  calculate(input: { subtotal: number; country?: string }): Promise<number>;
}

/**
 * 金流啟動介面（留接口給 payment-core providers）。
 */
export interface PaymentInitiator {
  initiate(input: {
    orderId: string;
    tenantId: string;
    provider: string;
    methodId: string;
    amount: number;
    currency: string;
    installments?: number;
  }): Promise<{ redirectUrl?: string; payload?: Record<string, unknown> }>;
}

/**
 * 庫存預扣介面（薄包裝 shop-inventory 的 reserve / release）。
 */
export interface InventoryReserver {
  reserve(input: {
    tenantId: string;
    items: Array<{ variantId: string; quantity: number }>;
    orderId: string;
  }): Promise<{ ok: boolean; failedVariantIds?: string[] }>;
  /**
   * 釋放預扣（payment.initiate 失敗時補回庫存）。
   *
   * 即使沒提供，逾時也會由 sweepExpired 釋放；
   * 提供此方法可立即還回，避免熱門商品長時間鎖庫。
   */
  release?(input: { tenantId: string; orderId: string }): Promise<void>;
}

/**
 * Cart 讀取介面。
 */
export interface CartReader {
  load(cartId: string): Promise<{
    items: Array<{
      variantId: string;
      productId: string;
      sku: string;
      title: string;
      unitPrice: number;
      quantity: number;
      categoryIds?: string[];
      optionValues?: Record<string, string>;
      thumbnailUrl?: string;
    }>;
  } | null>;
}

/**
 * 訂單編號產生器。
 */
export interface OrderNumberProvider {
  next(tenantId: string): Promise<string>;
}

/**
 * 結帳服務依賴注入。
 */
export interface CheckoutDeps {
  cart: CartReader;
  shipping: ShippingCalculator;
  tax: TaxCalculator;
  payment: PaymentInitiator;
  inventory: InventoryReserver;
  /**
   * 取得自動套用 + redeem 出來的所有 DiscountRule，
   * 並附帶該客戶針對每條規則的使用次數（per-user 限制用）。
   *
   * 回傳可為 `DiscountRule[]`（向後相容，視為使用次數 0）或 `CheckoutRulesResult`。
   */
  getRules: (input: {
    tenantId: string;
    couponCode?: string;
    userId: string | null;
  }) => Promise<DiscountRule[] | CheckoutRulesResult>;
  orderNumber: OrderNumberProvider;
  /** 給 OrderService 的依賴注入入口。 */
  orderId: () => string;
  /**
   * 持久化訂單。提供時 submit 會在啟動金流前寫入 DB；
   * 未提供視為純記憶體流程（測試 / 預覽用）。
   */
  persistOrder?: (order: Order) => Promise<void>;
  /**
   * 金流啟動失敗時的回滾鉤子。可在此標記訂單 cancelled、補回庫存等。
   *
   * 即使未提供，service 仍會嘗試呼叫 `inventory.release`，
   * 避免訂單卡在 pending-payment 同時鎖住庫存。
   */
  rollbackOrder?: (input: { order: Order; reason: unknown }) => Promise<void>;
}
