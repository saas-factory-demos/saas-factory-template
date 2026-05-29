/**
 * 客戶生命週期狀態（goal 01 §7）。
 */
export type LifecycleStage =
  | 'new'
  | 'active'
  | 'at-risk'
  | 'dormant'
  | 'lost';

export type CommunicationChannel =
  | 'order'
  | 'support'
  | 'email'
  | 'line'
  | 'sms'
  | 'push'
  | 'in-app';

/**
 * 客戶溝通歷史單筆（時間軸用）。
 */
export interface CommunicationEntry {
  id: string;
  customerId: string;
  tenantId?: string;
  channel: CommunicationChannel;
  /** 訊息主旨 / 摘要 */
  subject: string;
  /** 自由格式 metadata：orderId / emailMessageId / lineMessageId 等 */
  metadata?: Record<string, unknown>;
  /** 寄送方向：outbound（系統 / 商家發出）/ inbound（客戶回） */
  direction: 'outbound' | 'inbound';
  /** ISO timestamp */
  occurredAt: string;
}

/**
 * 客戶標籤定義。
 */
export interface CustomerTag {
  id: string;
  tenantId?: string;
  /** 標籤名稱（顯示用） */
  name: string;
  /** 內部 slug，用於規則匹配 */
  slug: string;
  /** 顏色（後台顯示） */
  color?: string;
  /** 標籤分類：手動 / 自動（規則套用） */
  source: 'manual' | 'automated';
  description?: string;
}

/**
 * 客戶分群定義。
 *
 * goal 01 階段僅定義資料結構與基本查詢介面；
 * 完整規則引擎留給 goal 07 marketing-automation 實作（ADR-0010 §7）。
 */
export interface CustomerSegment {
  id: string;
  tenantId?: string;
  name: string;
  description?: string;
  /** 標籤條件：全部命中（AND）才算 */
  requiredTags?: string[];
  /** 標籤條件：任一命中（OR）也可加入 */
  anyTags?: string[];
  /** 排除這些標籤 */
  excludedTags?: string[];
  /** 生命週期條件 */
  lifecycleStages?: LifecycleStage[];
}
