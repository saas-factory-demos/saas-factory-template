/** 觀看裝置 session 狀態。 */
export type DeviceSessionStatus = 'active' | 'revoked' | 'expired';

/** 一筆觀看裝置 session（同一台裝置 + 同一登入動作）。 */
export interface DeviceSession {
  id: string;
  tenantId: string;
  userId: string;
  /** 客戶端裝置指紋（瀏覽器 + UA + 螢幕 hash）。 */
  deviceId: string;
  userAgent?: string;
  ip?: string;
  /** ISO 3166-1 alpha-2，例：TW、JP。 */
  geoCountry?: string;
  /** 城市（粗粒度，供告警用）。 */
  geoCity?: string;
  status: DeviceSessionStatus;
  createdAt: Date;
  lastSeenAt: Date;
  /** 撤銷原因（force-logout-on-limit / geo-anomaly / manual / expired）。 */
  revokedReason?: string;
}

/** 註冊新 session 時的輸入。 */
export interface RegisterSessionInput {
  tenantId: string;
  userId: string;
  deviceId: string;
  userAgent?: string;
  ip?: string;
  geoCountry?: string;
  geoCity?: string;
  now?: Date;
}

/** 註冊 session 結果。 */
export interface RegisterSessionResult {
  session: DeviceSession;
  /** 因為超過上限而被踢掉的舊 session（按 lastSeenAt 由舊至新）。 */
  revoked: DeviceSession[];
  /** 是否觸發跨地理告警（不阻擋登入，但回傳供前端提示 / 後台審查）。 */
  geoAnomaly: boolean;
}

/** 裝置 session 儲存介面。 */
export interface DeviceSessionStore {
  list(tenantId: string, userId: string): Promise<DeviceSession[]>;
  get(id: string): Promise<DeviceSession | undefined>;
  upsert(session: DeviceSession): Promise<void>;
  delete(id: string): Promise<void>;
}

/** Service 設定。 */
export interface DeviceLimitConfig {
  /** 同時可用裝置上限（預設 3）。 */
  maxConcurrent?: number;
  /** session 心跳逾時秒數（超過視為 expired，預設 30 分鐘）。 */
  idleTimeoutSeconds?: number;
  /** 觸發跨地理告警的最短時間差（秒，預設 3600 = 1 小時內換國家就警告）。 */
  geoAnomalyWindowSeconds?: number;
}
