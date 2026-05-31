/** 觀看事件（由 progress / video player 上報）。 */
export interface WatchEvent {
  /** 學員 userId。 */
  userId: string;
  lessonId: string;
  /** 影片第幾秒。 */
  timestampSeconds: number;
  /** 事件類型。 */
  type: 'play' | 'pause' | 'seek-out' | 'completed' | 'replay';
  /** 此事件發生時的真實時間。 */
  occurredAt: Date;
}

/** 流失分析 4 維度結果（每秒 bucket）。 */
export interface EngagementAnalysis {
  lessonId: string;
  /** 影片總長度（秒）。 */
  durationSeconds: number;
  /** 每秒高亮值 = (play - seekOut) 之相對熱度。 */
  segments: EngagementSegment[];
  /** 精華段（連續高熱）。 */
  highlights: SegmentRange[];
  /** 流失段（pause / seek-out 集中區）。 */
  dropOffs: SegmentRange[];
  /** 重看段（replay 集中區）。 */
  replays: SegmentRange[];
  /** 完課率（completed event 數 / unique viewer 數）。 */
  completionRate: number;
}

export interface EngagementSegment {
  /** 此 bucket 起始秒（含）。 */
  startSecond: number;
  /** 此 bucket 結束秒（不含）。 */
  endSecond: number;
  playCount: number;
  pauseCount: number;
  seekOutCount: number;
  replayCount: number;
}

export interface SegmentRange {
  startSecond: number;
  endSecond: number;
  /** 強度分數（越高代表越強）。 */
  intensity: number;
}

/** 收益事件（由訂單 / 退款上報）。 */
export interface RevenueEvent {
  id: string;
  tenantId: string;
  instructorId: string;
  courseId: string;
  /** 金額（最小幣別單位，例如 cents / 分）。 */
  amountMinor: number;
  /** 平台抽成比例（0~1）。 */
  platformFeeRate: number;
  type: 'sale' | 'refund' | 'adjustment';
  occurredAt: Date;
}

/** 收益報表結果。 */
export interface RevenueReport {
  instructorId: string;
  from: Date;
  to: Date;
  grossMinor: number;
  refundMinor: number;
  netMinor: number;
  platformFeeMinor: number;
  payoutMinor: number;
  byCourse: Array<{ courseId: string; grossMinor: number; netMinor: number; payoutMinor: number }>;
}

/** 提領申請。 */
export interface PayoutRequest {
  id: string;
  tenantId: string;
  instructorId: string;
  amountMinor: number;
  /** 收款方式。 */
  method: 'bank-transfer' | 'ach' | 'wise';
  /** 收款資訊（加密 / masked 由上層處理，此處只存 reference）。 */
  payeeRef: string;
  /** 發票 / 收據檔案 R2 key。 */
  invoiceStorageKey?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestedAt: Date;
  processedAt?: Date;
  rejectionReason?: string;
}

/** 講師與學員的私訊（一對一）。 */
export interface DirectMessage {
  id: string;
  tenantId: string;
  /** 對話雙方的固定排序鍵（小 id 在前）：對話 id。 */
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  /** 發送方角色，用來在 UI 上分辨。 */
  fromRole: 'instructor' | 'learner';
  body: string;
  /** 讀取時間（被收方讀了才寫）。 */
  readAt?: Date;
  sentAt: Date;
}

/** 課程內容版本（重拍某單元不影響已購學員）。 */
export interface ContentVersion {
  id: string;
  tenantId: string;
  courseId: string;
  /** 版本號（單調遞增）。 */
  version: number;
  /** lesson id → 該 lesson 在此版本的 contentSnapshotId。 */
  lessonSnapshots: Record<string, string>;
  /** 發布時間。 */
  publishedAt: Date;
  /** 版本說明（例如「2026 重拍版」）。 */
  changelog?: string;
}

/** 學員 enrollment 對應到的版本鎖定。 */
export interface EnrollmentVersionLock {
  enrollmentId: string;
  courseId: string;
  /** 學員報名當下鎖到的版本。 */
  lockedVersion: number;
  /** 學員是否手動同意切到新版（true → 隨最新版）。 */
  followLatest: boolean;
}

/** Instructor store 介面。 */
export interface InstructorStore {
  appendWatchEvent(e: WatchEvent): Promise<void>;
  listWatchEvents(lessonId: string): Promise<WatchEvent[]>;
  appendRevenueEvent(e: RevenueEvent): Promise<void>;
  listRevenueEvents(instructorId: string, from: Date, to: Date): Promise<RevenueEvent[]>;
  upsertPayout(p: PayoutRequest): Promise<void>;
  getPayout(id: string): Promise<PayoutRequest | undefined>;
  listPayouts(instructorId: string): Promise<PayoutRequest[]>;
  appendDm(m: DirectMessage): Promise<void>;
  listDm(conversationId: string): Promise<DirectMessage[]>;
  markDmRead(id: string, readAt: Date): Promise<void>;
  upsertContentVersion(v: ContentVersion): Promise<void>;
  listContentVersions(courseId: string): Promise<ContentVersion[]>;
  upsertEnrollmentLock(lock: EnrollmentVersionLock): Promise<void>;
  getEnrollmentLock(enrollmentId: string): Promise<EnrollmentVersionLock | undefined>;
}
