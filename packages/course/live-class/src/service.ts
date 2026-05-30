import { randomUUID } from 'node:crypto';

import type {
  EnrollmentChecker,
  LiveClassProvider,
  LiveRecording,
  LiveSession,
  LiveSessionStore,
} from './types.js';

export interface ScheduleSessionInput {
  tenantId: string;
  courseId: string;
  lessonId?: string;
  hostUserId: string;
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  enableRecording?: boolean;
  now?: Date;
}

/** 直播課 service：排程 / 加入 / 結束 + 錄影歸檔。 */
export class LiveClassService {
  constructor(
    private readonly store: LiveSessionStore,
    private readonly provider: LiveClassProvider,
    /**
     * 註冊檢查器（選填，但生產環境必填）。
     * 沒注入時 `getJoinUrl` 會拒收 userId 不是 host 的請求，
     * 避免「忘記接 enrollment」就把直播連結公開。
     */
    private readonly enrollment?: EnrollmentChecker,
  ) {}

  /** 排定一場新直播。 */
  async scheduleSession(input: ScheduleSessionInput): Promise<LiveSession> {
    const created = await this.provider.createMeeting({
      title: input.title,
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes,
      hostUserId: input.hostUserId,
      enableRecording: input.enableRecording,
    });
    const session: LiveSession = {
      id: randomUUID(),
      tenantId: input.tenantId,
      courseId: input.courseId,
      lessonId: input.lessonId,
      providerType: this.provider.providerType,
      externalId: created.externalId,
      hostUserId: input.hostUserId,
      title: input.title,
      scheduledAt: input.scheduledAt,
      durationMinutes: input.durationMinutes,
      joinUrl: created.joinUrl,
      startUrl: created.startUrl,
      recordings: [],
      status: 'scheduled',
      createdAt: input.now ?? new Date(),
    };
    await this.store.upsert(session);
    return session;
  }

  /**
   * 取得學員加入連結。
   *
   * 1. 議程必須未取消、且落在「開始前 30 分鐘 ~ 結束後 30 分鐘」加入窗。
   * 2. host 本人或註冊學員才可拿到 joinUrl，避免連結被外流。
   */
  async getJoinUrl(
    sessionId: string,
    userId: string,
    now: Date = new Date(),
  ): Promise<string> {
    const s = await this.store.get(sessionId);
    if (!s) throw new Error('找不到直播議程');
    if (s.status === 'cancelled') throw new Error('此議程已取消');
    const openAt = new Date(s.scheduledAt.getTime() - 30 * 60_000);
    const closeAt = new Date(s.scheduledAt.getTime() + (s.durationMinutes + 30) * 60_000);
    if (now < openAt) throw new Error('尚未開放加入');
    if (now > closeAt) throw new Error('議程加入時段已過');
    if (userId !== s.hostUserId) {
      if (!this.enrollment) {
        throw new Error('未設定 enrollment checker，無法核對學員身份');
      }
      const enrolled = await this.enrollment.isEnrolled({
        tenantId: s.tenantId,
        courseId: s.courseId,
        userId,
      });
      if (!enrolled) throw new Error('您尚未註冊本課程，無法加入直播');
    }
    return s.joinUrl;
  }

  /** 結束直播 + 拉錄影 + 上架（呼叫端可再把 archivedStorageKey 回填）。 */
  async endSession(sessionId: string, now: Date = new Date()): Promise<LiveSession> {
    const s = await this.store.get(sessionId);
    if (!s) throw new Error('找不到直播議程');
    if (s.status !== 'ended') {
      try {
        await this.provider.endMeeting(s.externalId);
      } catch {
        // 某些 provider（Meet/Jitsi）沒有結束 API，吞掉錯誤
      }
    }
    let recordings: LiveRecording[] = [];
    try {
      recordings = await this.provider.fetchRecordings(s.externalId);
    } catch {
      recordings = [];
    }
    const updated: LiveSession = {
      ...s,
      status: 'ended',
      endedAt: now,
      recordings,
    };
    await this.store.upsert(updated);
    return updated;
  }

  /** 取消未開始的議程。 */
  async cancelSession(sessionId: string): Promise<void> {
    const s = await this.store.get(sessionId);
    if (!s) return;
    if (s.status !== 'scheduled') throw new Error('只能取消尚未開始的議程');
    try {
      await this.provider.endMeeting(s.externalId);
    } catch {
      /* 同上 */
    }
    s.status = 'cancelled';
    await this.store.upsert(s);
  }

  /** 列出該課程未來的直播（按時間正序）。 */
  async listUpcoming(tenantId: string, courseId: string, now: Date = new Date()): Promise<LiveSession[]> {
    const all = await this.store.listByCourse(tenantId, courseId);
    return all
      .filter((s) => s.status === 'scheduled' && s.scheduledAt.getTime() > now.getTime())
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  }

  /** 將錄影檔回填歸檔 key（外部把錄影複製到 R2 後呼叫）。 */
  async attachArchivedKey(
    sessionId: string,
    recordingIndex: number,
    storageKey: string,
  ): Promise<LiveSession> {
    const s = await this.store.get(sessionId);
    if (!s) throw new Error('找不到直播議程');
    const rec = s.recordings[recordingIndex];
    if (!rec) throw new Error(`錄影檔索引 ${recordingIndex} 不存在`);
    rec.archivedStorageKey = storageKey;
    await this.store.upsert(s);
    return s;
  }
}
