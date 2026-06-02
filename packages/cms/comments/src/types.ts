/** 留言狀態。 */
export type CommentStatus = 'pending' | 'approved' | 'spam' | 'rejected';

/** 留言實體。 */
export interface Comment {
  id: string;
  tenantId: string;
  /** 所屬文章 ID（或其他 entity ID，如 page id）。 */
  postId: string;
  /** 回覆對象（巢狀留言）。 */
  parentId?: string;
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  content: string;
  status: CommentStatus;
  ipAddress?: string;
  userAgent?: string;
  /** 系統判定為垃圾的原因（多個以分號分隔）。 */
  spamReasons?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** 建立留言輸入。 */
export interface CreateCommentInput {
  tenantId: string;
  postId: string;
  parentId?: string;
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  content: string;
  ipAddress?: string;
  userAgent?: string;
  /** Honeypot 欄位（前端隱藏，bot 才會填）。若有值即視為垃圾。 */
  honeypot?: string;
  /** Captcha token，會交給 verifyCaptcha 驗證。 */
  captchaToken?: string;
}

/** 留言查詢條件。 */
export interface CommentFilter {
  postId?: string;
  status?: CommentStatus;
  parentId?: string | null;
}

/** 留言儲存層介面。 */
export interface CommentStore {
  create(comment: Comment): Promise<Comment>;
  update(id: string, patch: Partial<Comment>): Promise<Comment>;
  findById(id: string): Promise<Comment | undefined>;
  list(tenantId: string, filter?: CommentFilter): Promise<Comment[]>;
  /** 計算指定 IP / email 在 windowMs 內留言數。 */
  countRecent(opts: {
    tenantId: string;
    ipAddress?: string;
    authorEmail?: string;
    sinceMs: number;
  }): Promise<number>;
}

/** Captcha 驗證函式介面（接 reCAPTCHA / hCaptcha 等）。 */
export type CaptchaVerifier = (token: string) => Promise<boolean>;

/** CommentService 設定。 */
export interface CommentServiceOptions {
  /** 最少內容長度。預設 2。 */
  minLength?: number;
  /** 最多內容長度。預設 5000。 */
  maxLength?: number;
  /** 內容允許的最大連結數（超過視為垃圾）。預設 3。 */
  maxLinks?: number;
  /** 同 IP 在 windowMs 內可留言次數上限。預設 5。 */
  rateLimit?: number;
  /** rate limit 視窗（毫秒）。預設 60_000。 */
  rateLimitWindowMs?: number;
  /** 關鍵字黑名單（命中則標記垃圾）。 */
  blockedKeywords?: string[];
  /** Captcha 驗證器（若提供，建立留言時必須通過）。 */
  verifyCaptcha?: CaptchaVerifier;
  /** 預設留言狀態（管理員可改）。預設 'pending'（後台審核）。 */
  defaultStatus?: CommentStatus;
}
