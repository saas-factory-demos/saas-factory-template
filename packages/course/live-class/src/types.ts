/** 直播平台類型。 */
export type LiveProviderType = 'zoom' | 'google-meet' | 'jitsi';

/** 直播議程狀態。 */
export type LiveSessionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

/** 直播錄影檔。 */
export interface LiveRecording {
  /** 錄影檔 URL（一般是 provider 提供的或歸檔後的 R2 URL）。 */
  url: string;
  /** 時長（秒）。 */
  durationSeconds: number;
  /** 錄影檔生成時間。 */
  recordedAt: Date;
  /** 歸檔到自家儲存後的 storage key（lazy 寫入）。 */
  archivedStorageKey?: string;
}

/** 直播議程。 */
export interface LiveSession {
  id: string;
  tenantId: string;
  courseId: string;
  lessonId?: string;
  providerType: LiveProviderType;
  /** Provider 端的會議 ID。 */
  externalId: string;
  hostUserId: string;
  title: string;
  /** 排定開始時間。 */
  scheduledAt: Date;
  /** 預計時長（分）。 */
  durationMinutes: number;
  /** 加入連結（不一定要簽 JWT）。 */
  joinUrl: string;
  /** 主持人連結（含啟動權限）。 */
  startUrl?: string;
  recordings: LiveRecording[];
  status: LiveSessionStatus;
  createdAt: Date;
  endedAt?: Date;
}

/** 建立會議的輸入。 */
export interface CreateMeetingInput {
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  hostUserId: string;
  /** 是否啟用雲端錄影（Zoom 有，Meet/Jitsi 不一定）。 */
  enableRecording?: boolean;
}

/** 建立會議的回傳。 */
export interface CreateMeetingResult {
  externalId: string;
  joinUrl: string;
  startUrl?: string;
}

/** 直播 provider 統一介面。 */
export interface LiveClassProvider {
  readonly providerType: LiveProviderType;
  createMeeting(input: CreateMeetingInput): Promise<CreateMeetingResult>;
  endMeeting(externalId: string): Promise<void>;
  /** 取得會議結束後的錄影檔（沒有則回傳空陣列）。 */
  fetchRecordings(externalId: string): Promise<LiveRecording[]>;
}

/** 直播議程 store。 */
export interface LiveSessionStore {
  get(id: string): Promise<LiveSession | undefined>;
  upsert(s: LiveSession): Promise<void>;
  listByCourse(tenantId: string, courseId: string): Promise<LiveSession[]>;
}

/**
 * 註冊狀態檢查器：由 enrollment 模組注入，
 * `getJoinUrl` 一定要拿來核對「目前學員是否已購買此課程且未退費」，
 * 避免直播連結被非學員撿到分享流量。
 */
export interface EnrollmentChecker {
  isEnrolled(input: {
    tenantId: string;
    courseId: string;
    userId: string;
  }): Promise<boolean>;
}
