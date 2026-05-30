/**
 * 通知 channel（goal 01 §7）。
 */
export type NotificationChannel = 'email' | 'sms' | 'line' | 'push' | 'in-app';

/**
 * 通知分類，用於決定行銷類同意判斷。
 */
export type NotificationCategory =
  | 'transactional' // 交易類（訂單、付款），不需 marketingConsent
  | 'security' // 安全類（登入警示、密碼變更），強制送
  | 'marketing' // 行銷類，需 marketingConsent[channel] = true
  | 'system'; // 系統通知（維護公告）

export interface NotificationPayload {
  userId: string;
  tenantId?: string;
  channels: NotificationChannel[];
  templateId: string;
  category: NotificationCategory;
  data: Record<string, unknown>;
  /** 同 templateId/userId 在此 window 內已送過則 dedupe（毫秒），預設不去重 */
  dedupeWindowMs?: number;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  tenantId?: string;
  templateId: string;
  channel: NotificationChannel;
  category: NotificationCategory;
  status: 'pending' | 'sent' | 'failed' | 'skipped';
  reason?: string;
  createdAt: string;
  readAt?: string;
}

export interface ChannelDispatchResult {
  channel: NotificationChannel;
  status: 'sent' | 'failed' | 'skipped';
  reason?: string;
  externalId?: string;
}

export interface MarketingConsent {
  email: boolean;
  sms: boolean;
  line: boolean;
  push: boolean;
}

export interface UserNotificationProfile {
  userId: string;
  consent: MarketingConsent;
  /** 個人開關：未列入或 true 才送 */
  preferences?: Partial<Record<NotificationChannel, boolean>>;
}

/**
 * Channel 寄送器：每個通道一個實作。
 */
export interface ChannelDispatcher {
  channel: NotificationChannel;
  dispatch(
    payload: NotificationPayload,
    profile: UserNotificationProfile,
  ): Promise<ChannelDispatchResult>;
}
