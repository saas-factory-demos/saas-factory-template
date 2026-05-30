/**
 * 物流模組核心型別。
 *
 * 包含 7 家 provider 共用契約：blackcat / hct / 7eleven / family-mart / hilife / post / international
 */

/** 物流通路 */
export type ShippingProviderName =
  | 'blackcat' // 黑貓宅配
  | 'hct' // 新竹貨運
  | '7eleven' // 7-11 交貨便 / 取貨付款
  | 'family-mart' // 全家店到店 / 取貨付款
  | 'hilife' // 萊爾富
  | 'post' // 中華郵政 i 郵箱
  | 'international'; // EMS / DHL / FedEx

/** 物流方式 */
export type ShippingMethod =
  | 'home-delivery' // 宅配（黑貓 / 新竹）
  | 'cvs-pickup' // 超商取貨（不付款）
  | 'cvs-pickup-cod' // 超商取貨付款
  | 'post-locker' // i 郵箱
  | 'international-express'; // 國際快遞

/** 物流訂單狀態 */
export type ShipmentStatus =
  | 'pending' // 已建單，待出貨
  | 'in-transit' // 運送中
  | 'arrived' // 到店 / 到貨
  | 'delivered' // 已取件
  | 'returning' // 退回中
  | 'returned' // 已退回
  | 'cancelled'; // 取消

/** 地址 */
export interface Address {
  /** 收件人 */
  name: string;
  phone: string;
  email?: string;
  /** 郵遞區號（3 碼或 6 碼） */
  zipCode?: string;
  /** 縣市 */
  city?: string;
  /** 區 */
  district?: string;
  /** 詳細地址 */
  address?: string;
  /** 國際地址用：國家代碼（ISO 3166-1 alpha-2） */
  country?: string;
}

/** 商品包裹資訊 */
export interface PackageInfo {
  /** 包裹重量（公克） */
  weightGrams: number;
  /** 長 cm */
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  /** 包裹數 */
  quantity?: number;
  /** 訂單金額（取貨付款用，分為單位） */
  collectAmount?: number;
}

/** 運費試算參數 */
export interface CalculateFeeParams {
  tenantId: string;
  method: ShippingMethod;
  sender: Address;
  receiver: Address;
  pkg: PackageInfo;
}

/** 建單參數 */
export interface CreateShipmentParams {
  tenantId: string;
  orderId: string;
  method: ShippingMethod;
  sender: Address;
  receiver: Address;
  pkg: PackageInfo;
  /** 超商取貨：門市代號 */
  cvsStoreId?: string;
  /** 預計出貨日（ISO date） */
  shipDate?: string;
  /** 備註 */
  remark?: string;
}

/** 建單結果 */
export interface ShipmentResult {
  shipmentId: string;
  /** 物流追蹤號 */
  trackingNumber: string;
  provider: ShippingProviderName;
  status: ShipmentStatus;
  /** 預估送達日（ISO date） */
  estimatedDelivery?: string;
  /** 運費（分為單位） */
  fee: number;
  /** 托運單 PDF 下載連結（若 provider 提供） */
  labelUrl?: string;
  raw: Record<string, unknown>;
}

/** 即時追蹤資訊 */
export interface TrackingInfo {
  trackingNumber: string;
  status: ShipmentStatus;
  events: Array<{
    timestamp: string;
    status: string;
    location?: string;
    description: string;
  }>;
  raw: Record<string, unknown>;
}

/** Webhook 事件（物流狀態變更） */
export interface ShippingWebhookEvent {
  provider: ShippingProviderName;
  trackingNumber: string;
  orderId?: string;
  status: ShipmentStatus;
  occurredAt: string;
  raw: Record<string, unknown>;
  signatureValid: boolean;
  error?: string;
}

/** Provider 介面 */
export interface ShippingProvider {
  readonly name: ShippingProviderName;
  /** 支援的物流方式 */
  readonly supportedMethods: readonly ShippingMethod[];
  /** 運費試算 */
  calculateFee(params: CalculateFeeParams): Promise<number>;
  /** 建單 */
  createShipment(params: CreateShipmentParams): Promise<ShipmentResult>;
  /** 取消單 */
  cancelShipment(trackingNumber: string): Promise<void>;
  /** 追蹤狀態 */
  trackShipment(trackingNumber: string): Promise<TrackingInfo>;
  /** 解析 webhook（簽章驗證） */
  parseWebhook(
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<ShippingWebhookEvent>;
  /** 列印托運單 PDF（若支援） */
  generateLabel?(shipmentId: string): Promise<Buffer>;
}
