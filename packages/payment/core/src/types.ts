/**
 * 金流抽象層核心型別定義。
 *
 * 設計決策（對應 ADR-0011）：
 * - 02-01：藍新 / 綠界 / Stripe 完整、其他 stub
 * - 02-02：後台同意即觸發退款（不二次確認）
 * - 02-04：每筆訂單記金流手續費
 * - 02-08：訂閱失敗重試 D+1 / D+3 / D+7
 * - 02-09：webhook 驗簽失敗 → audit-log + 4xx + 告警
 * - 02-10：金額一律 minor unit（cents 級）+ ISO 4217 currency code
 */

/** 可選的金流方式（涵蓋台灣 + 國際） */
export type PaymentMethod =
  | 'credit'
  | 'credit-installment'
  | 'atm'
  | 'cvs'
  | 'cvs-barcode'
  | 'webatm'
  | 'linepay'
  | 'jkopay'
  | 'applepay'
  | 'googlepay'
  | 'samsungpay'
  | 'pi-wallet'
  | 'easycard'
  | 'esun-wallet'
  | 'taiwanpay'
  | 'stripe-card'
  | 'paypal'
  | 'cod'
  | 'enterprise-transfer';

/** 已啟用的金流 provider 名稱（用於 router 註冊 + config 控制） */
export type PaymentProviderName =
  | 'newebpay'
  | 'ecpay'
  | 'linepay-official'
  | 'jkopay-official'
  | 'tappay'
  | 'stripe'
  | 'paypal';

/** ISO 4217 貨幣代碼（v1 支援的範圍） */
export type CurrencyCode = 'TWD' | 'USD' | 'JPY' | 'EUR' | 'CNY' | 'HKD' | 'SGD';

/**
 * 金額（一律 minor unit）。
 * TWD：cents 級即「元」（TWD 沒有小數），但仍走 integer 不允許浮點
 * USD：cents 級即「分」（1 美金 = 100）
 */
export interface Money {
  amount: number; // integer，minor unit
  currency: CurrencyCode;
}

/** 分期期數（藍新 / 綠界 / Stripe Installment 共用） */
export type InstallmentPeriod = 3 | 6 | 12 | 18 | 24;

/** 建立扣款請求 */
export interface ChargeRequest {
  orderId: string;
  tenantId: string;
  method: PaymentMethod;
  amount: Money;
  /** 信用卡分期：搭配 method=credit-installment */
  installment?: InstallmentPeriod;
  /** 訂閱付款（rebill）→ 改走 createSubscription，不在 charge 內 */
  description?: string;
  /** 結帳成功後跳轉前端 URL（hosted checkout 用） */
  returnUrl?: string;
  /** 失敗 / 取消跳轉 URL */
  cancelUrl?: string;
  /** provider 回 callback 的伺服器端 URL */
  notifyUrl?: string;
  /** 防止重複扣款的 idempotency key（同一單 ≤ 2 次內必須返回相同結果） */
  idempotencyKey: string;
  /** 買受人資訊（金流 KYC 部分需用） */
  buyer?: {
    email?: string;
    phone?: string;
    name?: string;
  };
}

/** 扣款結果 */
export interface ChargeResult {
  /** 內部訂單 ID */
  orderId: string;
  /** provider 回傳的交易編號 */
  providerTradeId: string;
  /** 哪一家 provider 處理的 */
  provider: PaymentProviderName;
  /** 實際使用方法 */
  method: PaymentMethod;
  /** 狀態 */
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired';
  /** 扣款金額 */
  amount: Money;
  /** 金流手續費（02-04 要求） */
  fee?: Money;
  /** 若 hosted checkout，跳轉的 URL */
  redirectUrl?: string;
  /** ATM / 超商代碼 / barcode 顯示資訊 */
  paymentInstructions?: {
    bankCode?: string;
    virtualAccount?: string;
    cvsCode?: string;
    barcode1?: string;
    barcode2?: string;
    barcode3?: string;
    expireAt?: string; // ISO timestamp
  };
  /** 原始 provider 回應（debug 用，prod 也保留以利退款） */
  raw?: Record<string, unknown>;
}

/** 退款請求 */
export interface RefundRequest {
  orderId: string;
  tenantId: string;
  providerTradeId: string;
  /** 不指定 = 全額退；指定 = 部分退 */
  amount?: Money;
  reason?: string;
  /** 同 charge，去重 */
  idempotencyKey: string;
}

/** 退款結果 */
export interface RefundResult {
  orderId: string;
  providerTradeId: string;
  refundId: string;
  amount: Money;
  status: 'pending' | 'refunded' | 'failed';
  raw?: Record<string, unknown>;
}

/** 定期定額（訂閱）請求 */
export interface SubscriptionRequest {
  orderId: string;
  tenantId: string;
  method: PaymentMethod;
  amount: Money;
  /** 扣款週期 */
  interval: 'day' | 'week' | 'month' | 'year';
  intervalCount: number;
  /** 第一期立即扣？ */
  startImmediately?: boolean;
  returnUrl?: string;
  notifyUrl?: string;
  idempotencyKey: string;
  buyer?: ChargeRequest['buyer'];
}

/** 訂閱結果 */
export interface SubscriptionResult {
  orderId: string;
  providerTradeId: string;
  provider: PaymentProviderName;
  subscriptionId: string;
  status: 'active' | 'paused' | 'cancelled' | 'failed';
  nextBillingAt?: string; // ISO
  redirectUrl?: string;
  raw?: Record<string, unknown>;
}

/** webhook 解析後的事件型別（router 共用） */
export interface WebhookEvent {
  provider: PaymentProviderName;
  /** 事件種類 */
  type:
    | 'charge.paid'
    | 'charge.failed'
    | 'charge.cancelled'
    | 'refund.completed'
    | 'subscription.charged'
    | 'subscription.failed'
    | 'subscription.cancelled';
  orderId?: string;
  providerTradeId: string;
  amount?: Money;
  /** 失敗時帶 error 描述 */
  error?: string;
  raw: Record<string, unknown>;
  /** 簽章是否通過（false 則 router 拒絕並寫 audit） */
  signatureValid: boolean;
  /** 同一 event 多次抵達時用此 key 去重 */
  idempotencyKey: string;
  occurredAt: string;
}

/** provider 必須實作的介面 */
export interface PaymentProvider {
  readonly name: PaymentProviderName;
  /** 此 provider 支援哪些 PaymentMethod */
  readonly supportedMethods: readonly PaymentMethod[];

  charge(request: ChargeRequest): Promise<ChargeResult>;
  refund(request: RefundRequest): Promise<RefundResult>;
  createSubscription?(request: SubscriptionRequest): Promise<SubscriptionResult>;
  cancelSubscription?(subscriptionId: string): Promise<void>;

  /** 解析並驗證 webhook payload */
  parseWebhook(
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<WebhookEvent>;

  /** 單筆查詢（對帳用） */
  queryTransaction?(providerTradeId: string): Promise<ChargeResult>;
}
