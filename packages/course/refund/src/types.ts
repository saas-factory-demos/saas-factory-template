/** 退費政策（每課程或租戶預設）。 */
export interface RefundPolicy {
  id: string;
  tenantId: string;
  scope: 'tenant' | 'course';
  courseId?: string;
  /** 鑑賞期天數（台灣消保法常見 7 天）。 */
  coolingOffDays: number;
  /** 鑑賞期內可全額退費的觀看上限（0~1）。超過 30% 視為「已消費」。 */
  maxWatchedRatioForFullRefund: number;
  /** 鑑賞期過後是否仍可按比例退費。 */
  allowProRataAfterCoolingOff: boolean;
  /** 按比例退費的依據：'remaining-lessons' / 'remaining-days'。 */
  proRataBasis: 'remaining-lessons' | 'remaining-days';
  /** 課程開課日（提供按 days 計算用）。 */
  courseDurationDays?: number;
}

/** 退費資格判定。 */
export interface RefundEligibility {
  eligible: boolean;
  /** 'full' 全額 / 'pro-rata' 按比例 / 'none' 不退。 */
  mode: 'full' | 'pro-rata' | 'none';
  /** 可退金額（最小幣別單位）。 */
  refundableMinor: number;
  /** 不可退原因（mode='none' 時）。 */
  reason?: string;
}

/** 退費原因（合規記錄）。 */
export type RefundReason =
  | 'cooling-off'
  | 'content-mismatch'
  | 'technical-issue'
  | 'duplicated-purchase'
  | 'other';

/** 退費申請。 */
export interface RefundRequest {
  id: string;
  tenantId: string;
  orderId: string;
  enrollmentId: string;
  userId: string;
  courseId: string;
  /** 原始訂單金額。 */
  originalAmountMinor: number;
  /** 申請當下決定的可退金額。 */
  refundableMinor: number;
  reason: RefundReason;
  reasonText?: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  /** 自動連動的發票折讓單號（呼叫 invoice.issueAllowance 後寫回）。 */
  invoiceAllowanceId?: string;
  requestedAt: Date;
  processedAt?: Date;
  rejectionReason?: string;
}

/** 退費 store 介面。 */
export interface RefundStore {
  upsertPolicy(p: RefundPolicy): Promise<void>;
  findPolicy(tenantId: string, courseId: string): Promise<RefundPolicy | undefined>;
  upsertRequest(r: RefundRequest): Promise<void>;
  getRequest(id: string): Promise<RefundRequest | undefined>;
  listByOrder(orderId: string): Promise<RefundRequest[]>;
}

/**
 * 發票折讓 hook（由 invoice 模組提供）。
 *
 * 自動連動「部分退款 + 部分發票折讓」：退費核准時呼叫此 hook 開折讓單。
 */
export type IssueAllowanceHook = (input: {
  orderId: string;
  refundAmountMinor: number;
  reason: string;
}) => Promise<{ allowanceId: string }>;

/**
 * 進度水合 hook（由 progress 模組提供）。
 *
 * `createRequest` 用伺服端權威進度覆蓋 client 傳入值，
 * 避免被偽造的 `watchedRatio: 0` 騙到全額退費。
 */
export type ProgressHydrator = (input: {
  tenantId: string;
  userId: string;
  courseId: string;
  enrollmentId: string;
}) => Promise<{
  watchedRatio: number;
  completedLessons?: number;
  totalLessons?: number;
}>;
