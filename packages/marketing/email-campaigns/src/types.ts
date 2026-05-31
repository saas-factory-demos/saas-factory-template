/** Email Campaign。 */
export interface EmailCampaign {
  id: string;
  tenantId: string;
  name: string;
  subject: string;
  /** HTML 內容（模板已 render）。 */
  bodyHtml: string;
  /** 純文字版（合規 + 容錯）。 */
  bodyText: string;
  /** 發信人。 */
  fromEmail: string;
  fromName: string;
  /** 收件 segment id。 */
  segmentId: string;
  /** 排程時間。 */
  scheduledAt: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

/** 單一 recipient 寄送紀錄。 */
export interface EmailSend {
  id: string;
  campaignId: string;
  tenantId: string;
  customerId: string;
  toEmail: string;
  status: 'pending' | 'sent' | 'skipped' | 'failed' | 'bounced';
  /** skipped 原因（unsubscribed / frequency-cap / no-consent）。 */
  skipReason?: 'unsubscribed' | 'frequency-cap' | 'no-consent';
  sentAt?: Date;
  /** Provider message id（用來收 webhook event）。 */
  providerMessageId?: string;
  error?: string;
}

/** Provider 回拋事件。 */
export type EmailEventKind = 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained';

export interface EmailEvent {
  id: string;
  sendId: string;
  kind: EmailEventKind;
  at: Date;
  /** clicked 時的目標 URL。 */
  url?: string;
}

/** 退訂紀錄。 */
export interface Unsubscribe {
  tenantId: string;
  email: string;
  at: Date;
  /** 由哪封信退訂（用於分析）。 */
  fromCampaignId?: string;
}

/** Campaign 統計。 */
export interface CampaignStats {
  campaignId: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

/** 寄信介面注入。 */
export interface EmailSenderHandler {
  send(input: {
    toEmail: string;
    fromEmail: string;
    fromName: string;
    subject: string;
    bodyHtml: string;
    bodyText: string;
  }): Promise<{ ok: boolean; providerMessageId?: string; error?: string }>;
}

/** 頻率上限：同 email N 小時最多 M 封 campaign。 */
export interface FrequencyPolicy {
  windowHours: number;
  maxEmailsInWindow: number;
}
