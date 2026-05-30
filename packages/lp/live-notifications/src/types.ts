/** 通知顯示位置。 */
export type NotificationPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

/** 通知模式。 */
export type NotificationMode =
  | 'real' // 從訂單庫拉
  | 'simulated'; // 後台設名單隨機顯示

/** 合規標籤。real 必須標 verified；simulated 必須標 sample。 */
export type ComplianceLabel = 'verified' | 'sample';

/** LP live-notifications 設定。 */
export interface LiveNotificationConfig {
  tenantId: string;
  pageId: string;
  enabled: boolean;
  mode: NotificationMode;
  position: NotificationPosition;
  /** 進入頁面到第一則出現的延遲秒數。 */
  firstDelaySeconds: number;
  /** 兩則之間的間隔秒數（秒，範圍 min~max 隨機）。 */
  intervalRange: { minSeconds: number; maxSeconds: number };
  /** simulated 模式：後台輸入的名單。 */
  simulatedPool?: SimulatedNotification[];
  /** real 模式：要顯示哪幾個產品（空表示全部）。 */
  realProductIds?: string[];
  /** real 模式：往回看幾分鐘的訂單。 */
  realLookbackMinutes?: number;
}

/** 模擬訂單（後台輸入）。 */
export interface SimulatedNotification {
  /** 顯示名稱（建議匿名化：陳O芳）。 */
  displayName: string;
  productTitle: string;
  /** 顯示位置（地區，例如「台北市」）。 */
  locationHint?: string;
}

/** 真實訂單（從 orders 庫帶來）。 */
export interface RealOrderSnapshot {
  id: string;
  displayName: string;
  productId: string;
  productTitle: string;
  locationHint?: string;
  /** 下單時間，給 timeAgo 用。 */
  createdAt: Date;
}

/** 通知 payload（傳給前台渲染）。 */
export interface NotificationPayload {
  id: string;
  displayName: string;
  productTitle: string;
  locationHint?: string;
  /** 「5 分鐘前」式字串；simulated 模式為近期隨機 1~30 分鐘。 */
  timeAgoLabel: string;
  position: NotificationPosition;
  /** 合規標籤（必填）。 */
  compliance: ComplianceLabel;
}
