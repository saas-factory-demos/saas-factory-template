/**
 * Factory ↔ Template 維修通道請求 / 回應 / 稽核紀錄型別。
 *
 * 為何拆獨立檔：types 由 client 與 verify 共用，避免循環依賴。
 */

/** 6 種可執行的維修動作。 */
export type SupportAccessAction =
  | 'provision'
  | 'rotate-password'
  | 'disable'
  | 'enable'
  | 'status'
  | 'audit-log';

/** Provision：建立 factory-support 帳號（idempotent）。 */
export interface SupportAccessProvisionRequest {
  /** factory-support 帳號 email（建議 `support+<subdomain>@<your-domain>`）。 */
  email: string;
  /** 操作者 email（factory owner / engineer 個人 email，寫進 audit log）。 */
  actorEmail: string;
}

export interface SupportAccessProvisionResponse {
  ok: true;
  /** 第一次建立時回傳；idempotent 時為 null。 */
  initialPassword: string | null;
  alreadyProvisioned: boolean;
}

/** Rotate password：產新密碼覆蓋。 */
export interface SupportAccessRotateRequest {
  actorEmail: string;
  /** 操作摘要，例：「協助修復結帳流程」（寫 audit log）。 */
  reason: string;
}

export interface SupportAccessRotateResponse {
  ok: true;
  newPassword: string;
}

/** Disable：客戶請求停用維修通道時。 */
export interface SupportAccessDisableRequest {
  actorEmail: string;
  reason: string;
}

export interface SupportAccessDisableResponse {
  ok: true;
  disabledAt: string;
}

/** Enable：解除 disable。 */
export interface SupportAccessEnableRequest {
  actorEmail: string;
  reason: string;
}

export interface SupportAccessEnableResponse {
  ok: true;
  enabledAt: string;
}

/** Status：查目前狀態。 */
export interface SupportAccessStatusRequest {
  actorEmail: string;
}

export interface SupportAccessStatusResponse {
  ok: true;
  provisioned: boolean;
  disabled: boolean;
  /** 最近一次 login，若無則 null。 */
  lastLoginAt: string | null;
  /** 本月 audit log 累積筆數（從第 1 號自然日起算）。 */
  monthlyAccessCount: number;
}

/** 錯誤回應（所有 action 共用）。 */
export interface SupportAccessErrorResponse {
  ok: false;
  /** 失敗原因 code。 */
  reason:
    | 'config-missing'
    | 'headers-missing'
    | 'hmac-malformed'
    | 'hmac-expired'
    | 'hmac-mismatch'
    | 'body-invalid'
    | 'forbidden'
    | 'not-found'
    | 'create-failed'
    | 'internal-error';
  message: string;
}

/** Audit log 單筆紀錄結構（與 Payload collection 對齊）。 */
export interface SupportAccessAuditEntry {
  /** 操作類型。 */
  action: SupportAccessAction | 'login' | 'manual-action';
  /** 操作者 email。 */
  actorEmail: string;
  /** 來源 IP（保留到 /24）。 */
  clientIp?: string;
  /** UA。 */
  userAgent?: string;
  /** 操作摘要。 */
  payloadSummary: string;
  /** 時間戳（ISO）。 */
  timestamp: string;
}

/**
 * Audit-log 查詢：分頁取回近期紀錄（給 factory 後台 / L3 退場驗證腳本用）。
 *
 * 不是寫操作，但仍走 HMAC 簽章，避免任何人可枚舉客戶站存取軌跡。
 */
export interface SupportAccessAuditLogRequest {
  actorEmail: string;
  /** 想取的筆數，1-100，預設 20。 */
  limit?: number;
  /** 分頁起始（ISO timestamp，回傳的最後一筆 timestamp）。 */
  before?: string;
  /** 篩選特定 action（不填則全部）。 */
  filterAction?: SupportAccessAction | 'login' | 'manual-action';
}

export interface SupportAccessAuditLogResponse {
  ok: true;
  entries: SupportAccessAuditEntry[];
  /** 還有更多時的下一頁游標。 */
  nextCursor: string | null;
  /** 總筆數（粗略，> 1000 時顯示 1000+）。 */
  totalEstimate: number;
}
