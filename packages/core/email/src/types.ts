/**
 * Email 模板 ID（對應 goal 01 §2 內建模板列表）。
 *
 * 模板實際 React Email 元件交由 apps 端定義；本 package 只定義契約。
 */
export type EmailTemplateId =
  | 'welcome'
  | 'verify-email'
  | 'reset-password'
  | 'order-confirmed'
  | 'order-shipped'
  | 'order-cancelled'
  | 'refund-issued'
  | 'cart-abandoned-1'
  | 'cart-abandoned-2'
  | 'cart-abandoned-3'
  | 'subscription-created'
  | 'subscription-cancelled'
  | 'course-enrolled'
  | 'course-completed'
  | 'support-reply'
  | 'login-alert';

export interface SendEmailParams {
  to: string | string[];
  from?: string;
  subject: string;
  /** Plain HTML 內容（已 render 過模板） */
  html: string;
  /** Plain text fallback */
  text?: string;
  /** 額外 header */
  headers?: Record<string, string>;
  /** Resend tag（追蹤分類） */
  tags?: Array<{ name: string; value: string }>;
}

export interface BatchEmailParams {
  emails: SendEmailParams[];
}

export interface EmailResult {
  id: string;
  to: string[];
  status: 'queued' | 'sent' | 'failed';
  error?: string;
}

export interface BatchResult {
  results: EmailResult[];
  successCount: number;
  failureCount: number;
}

/**
 * 模板渲染輸入資料。
 *
 * 結構由各模板自定義；shape 通常為 `{ customerName, orderNumber, ... }`。
 */
export type TemplateData = Record<string, unknown>;

export interface TemplateRenderer {
  render(templateId: EmailTemplateId, data: TemplateData): Promise<string>;
}
