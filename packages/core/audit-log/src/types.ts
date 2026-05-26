/**
 * Audit log 紀錄條目。
 *
 * 規則：
 * - append-only：任何資源都不可 update / delete 既有條目
 * - 跨 tenant 操作（bypassTenant = true）會自動標 `crossTenant: true`
 * - 高敏感欄位（如密碼、API token）必須在寫入前 redact
 */
export interface AuditLogEntry {
  id?: string;
  /** 操作者 user id；系統觸發為 null */
  userId: string | null;
  /** 操作所屬 tenant；全域系統操作為 null */
  tenantId: string | null;
  /** 操作名稱，格式 `<resource>.<action>`，例：`order.refund` */
  action: string;
  /** 被操作資源類型，例：`Order` */
  resourceType: string;
  /** 被操作資源 ID */
  resourceId: string;
  /** 操作前狀態（JSON 可序列化） */
  before?: Record<string, unknown> | null;
  /** 操作後狀態（JSON 可序列化） */
  after?: Record<string, unknown> | null;
  /** 額外資訊：reason、IP、UA、相關訂單號等 */
  metadata?: Record<string, unknown>;
  /** 是否跨 tenant 操作 */
  crossTenant?: boolean;
  /** 操作來源 IP */
  ip?: string;
  /** User-Agent */
  userAgent?: string;
  /** 寫入時間（server 端強制覆寫） */
  createdAt?: string;
}

export type RecordParams = Omit<AuditLogEntry, 'id' | 'createdAt'>;
