/** LP 內容快照（由 lp-builder 的 LpPage 投影過來）。 */
export interface LpSnapshot {
  /** page 結構 + blocks 全文，序列化前先 deepCopy。 */
  pageData: Record<string, unknown>;
}

/** 單一版本。 */
export interface LpVersion {
  id: string;
  tenantId: string;
  pageId: string;
  /** 自增序號（v1 / v2 / v3...）。 */
  version: number;
  /** 後台可命名（例：「特賣版」）。 */
  name?: string;
  /** 備註。 */
  note?: string;
  snapshot: LpSnapshot;
  /** 建立者 user id。 */
  createdBy: string;
  createdAt: Date;
  /** 是否為目前的 production 版本。 */
  isProduction: boolean;
  /** 排程上線時間（>= now 才有意義）。 */
  scheduledFor?: Date;
}

/** 預覽連結（給客戶看 / 給內部審稿）。 */
export interface PreviewLink {
  id: string;
  versionId: string;
  /** 短碼，產生 URL：/preview/<token>。 */
  token: string;
  /** 可選密碼（bcrypt 處理由外層）。 */
  passwordHash?: string;
  /** 過期時間。 */
  expiresAt?: Date;
  createdAt: Date;
}
