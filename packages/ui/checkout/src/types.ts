/**
 * 結帳頁元件共用型別。
 *
 * Lock：ADR-0011 §02-12 v1。
 */

/**
 * 付款方式選項。
 */
export interface PaymentMethodOption {
  /** 唯一代碼，例如 credit-card / atm / cvs / linepay。 */
  id: string;
  /** 顯示名稱。 */
  label: string;
  /** 圖示來源（emoji 或圖片 URL）。 */
  icon?: string;
  /** 額外說明，例如「支援分期 3／6／12」。 */
  description?: string;
  /** 是否停用。 */
  disabled?: boolean;
}

/**
 * 分期期數選項。
 */
export interface InstallmentOption {
  /** 期數，例如 3、6、12。 */
  periods: number;
  /** 每期金額。 */
  perPeriodAmount: number;
  /** 顯示貨幣。 */
  currency: string;
}

/**
 * 物流方式選項。
 */
export interface ShippingMethodOption {
  /** 唯一代碼，例如 home-delivery / cvs-pickup。 */
  id: string;
  /** 顯示名稱。 */
  label: string;
  /** 運費。 */
  fee: number;
  /** 預估送達時間描述，例如「1～3 個工作天」。 */
  eta?: string;
  /** 是否停用。 */
  disabled?: boolean;
}

/**
 * 超商門市資料。
 */
export interface CvsStore {
  /** 門市代號。 */
  storeId: string;
  /** 門市名稱。 */
  storeName: string;
  /** 門市地址。 */
  address: string;
  /** 通路：7-11 / 全家 / 萊爾富。 */
  brand: '7eleven' | 'family-mart' | 'hilife';
}

/**
 * 發票表單資料。
 */
export interface InvoiceFormValue {
  /** 載具類型。 */
  carrierType:
    | 'mobile-barcode'
    | 'natural-person-cert'
    | 'company-tax-id'
    | 'donation'
    | 'member'
    | 'paper';
  /** 載具代號（手機條碼 / 自然人憑證 / 統編 / 捐贈碼）。 */
  carrierCode?: string;
  /** 公司抬頭（統編發票用）。 */
  companyTitle?: string;
}
