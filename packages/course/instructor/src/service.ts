import { randomUUID } from 'node:crypto';

import type {
  ContentVersion,
  DirectMessage,
  EngagementAnalysis,
  EngagementSegment,
  EnrollmentVersionLock,
  InstructorStore,
  PayoutRequest,
  RevenueEvent,
  RevenueReport,
  SegmentRange,
  WatchEvent,
} from './types.js';

export interface AnalyzeEngagementInput {
  lessonId: string;
  durationSeconds: number;
  /** bucket 秒寬度（預設 10）。 */
  bucketSeconds?: number;
  /** 精華 / 流失 / 重看的 z-score 門檻（預設 1.0）。 */
  threshold?: number;
}

export interface SendDmInput {
  tenantId: string;
  fromUserId: string;
  toUserId: string;
  fromRole: 'instructor' | 'learner';
  body: string;
  now?: Date;
}

/** 講師後台 service：流失分析 + 收益儀表板 + 提領 + 私訊 + 內容版本。 */
export class InstructorService {
  constructor(private readonly store: InstructorStore) {}

  /** 寫入觀看事件（由 video player / progress 上報）。 */
  recordWatchEvent(e: WatchEvent): Promise<void> {
    return this.store.appendWatchEvent(e);
  }

  /** 寫入收益事件（由 order / refund 上報）。 */
  recordRevenueEvent(e: RevenueEvent): Promise<void> {
    return this.store.appendRevenueEvent(e);
  }

  /**
   * 流失分析 4 維度：精華、流失、重看、完課率分布。
   *
   * 演算法：每秒 bucket 化事件 → 對播放熱度做 z-score → 高於 threshold 為精華、
   * pause/seek-out 高於 threshold 為流失、replay 高於 threshold 為重看。
   */
  async analyzeEngagement(input: AnalyzeEngagementInput): Promise<EngagementAnalysis> {
    const bucket = input.bucketSeconds ?? 10;
    const threshold = input.threshold ?? 1.0;
    const events = await this.store.listWatchEvents(input.lessonId);
    const bucketCount = Math.max(1, Math.ceil(input.durationSeconds / bucket));
    const segments: EngagementSegment[] = Array.from({ length: bucketCount }, (_, i) => ({
      startSecond: i * bucket,
      endSecond: Math.min((i + 1) * bucket, input.durationSeconds),
      playCount: 0,
      pauseCount: 0,
      seekOutCount: 0,
      replayCount: 0,
    }));
    const uniqueViewers = new Set<string>();
    const completers = new Set<string>();
    for (const e of events) {
      uniqueViewers.add(e.userId);
      if (e.type === 'completed') completers.add(e.userId);
      const idx = Math.min(bucketCount - 1, Math.floor(e.timestampSeconds / bucket));
      const seg = segments[idx];
      if (!seg) continue;
      if (e.type === 'play') seg.playCount++;
      else if (e.type === 'pause') seg.pauseCount++;
      else if (e.type === 'seek-out') seg.seekOutCount++;
      else if (e.type === 'replay') seg.replayCount++;
    }
    const highlights = detectPeaks(
      segments.map((s) => s.playCount - s.seekOutCount),
      segments,
      threshold,
    );
    const dropOffs = detectPeaks(
      segments.map((s) => s.pauseCount + s.seekOutCount),
      segments,
      threshold,
    );
    const replays = detectPeaks(
      segments.map((s) => s.replayCount),
      segments,
      threshold,
    );
    return {
      lessonId: input.lessonId,
      durationSeconds: input.durationSeconds,
      segments,
      highlights,
      dropOffs,
      replays,
      completionRate: uniqueViewers.size > 0 ? completers.size / uniqueViewers.size : 0,
    };
  }

  /** 收益儀表板（時間區間 + 按課程）。 */
  async computeRevenue(instructorId: string, from: Date, to: Date): Promise<RevenueReport> {
    const events = await this.store.listRevenueEvents(instructorId, from, to);
    let grossMinor = 0;
    let refundMinor = 0;
    let platformFeeMinor = 0;
    const byCourse = new Map<string, { grossMinor: number; netMinor: number; payoutMinor: number }>();
    for (const ev of events) {
      const b = byCourse.get(ev.courseId) ?? { grossMinor: 0, netMinor: 0, payoutMinor: 0 };
      if (ev.type === 'sale') {
        grossMinor += ev.amountMinor;
        b.grossMinor += ev.amountMinor;
        const fee = Math.round(ev.amountMinor * ev.platformFeeRate);
        platformFeeMinor += fee;
        b.netMinor += ev.amountMinor - fee;
        b.payoutMinor += ev.amountMinor - fee;
      } else if (ev.type === 'refund') {
        refundMinor += ev.amountMinor;
        b.grossMinor -= ev.amountMinor;
        const fee = Math.round(ev.amountMinor * ev.platformFeeRate);
        platformFeeMinor -= fee;
        b.netMinor -= ev.amountMinor - fee;
        b.payoutMinor -= ev.amountMinor - fee;
      } else {
        b.payoutMinor += ev.amountMinor;
      }
      byCourse.set(ev.courseId, b);
    }
    const netMinor = grossMinor - refundMinor;
    const payoutMinor = netMinor - platformFeeMinor;
    return {
      instructorId,
      from,
      to,
      grossMinor,
      refundMinor,
      netMinor,
      platformFeeMinor,
      payoutMinor,
      byCourse: Array.from(byCourse.entries()).map(([courseId, v]) => ({ courseId, ...v })),
    };
  }

  /** 講師提領申請。 */
  async requestPayout(input: {
    tenantId: string;
    instructorId: string;
    amountMinor: number;
    method: PayoutRequest['method'];
    payeeRef: string;
    invoiceStorageKey?: string;
    now?: Date;
  }): Promise<PayoutRequest> {
    if (input.amountMinor <= 0) throw new Error('提領金額需大於 0');
    const p: PayoutRequest = {
      id: randomUUID(),
      tenantId: input.tenantId,
      instructorId: input.instructorId,
      amountMinor: input.amountMinor,
      method: input.method,
      payeeRef: input.payeeRef,
      invoiceStorageKey: input.invoiceStorageKey,
      status: 'pending',
      requestedAt: input.now ?? new Date(),
    };
    await this.store.upsertPayout(p);
    return p;
  }

  /** 核准 / 拒絕提領（後台用）。 */
  async processPayout(
    id: string,
    decision: 'approve' | 'reject' | 'mark-paid',
    opts: { now?: Date; rejectionReason?: string } = {},
  ): Promise<PayoutRequest> {
    const p = await this.store.getPayout(id);
    if (!p) throw new Error('找不到提領申請');
    const now = opts.now ?? new Date();
    if (decision === 'approve') {
      if (p.status !== 'pending') throw new Error('只有 pending 可核准');
      p.status = 'approved';
    } else if (decision === 'reject') {
      if (p.status !== 'pending') throw new Error('只有 pending 可拒絕');
      p.status = 'rejected';
      p.rejectionReason = opts.rejectionReason;
    } else {
      if (p.status !== 'approved') throw new Error('只有 approved 可標記為已付款');
      p.status = 'paid';
    }
    p.processedAt = now;
    await this.store.upsertPayout(p);
    return p;
  }

  /** 講師對學員私訊（雙向）。 */
  async sendDm(input: SendDmInput): Promise<DirectMessage> {
    if (!input.body.trim()) throw new Error('訊息內容不可為空');
    const conversationId = buildConversationId(input.fromUserId, input.toUserId);
    const m: DirectMessage = {
      id: randomUUID(),
      tenantId: input.tenantId,
      conversationId,
      fromUserId: input.fromUserId,
      toUserId: input.toUserId,
      fromRole: input.fromRole,
      body: input.body,
      sentAt: input.now ?? new Date(),
    };
    await this.store.appendDm(m);
    return m;
  }

  /** 列出對話訊息（依時間排序）。 */
  async listConversation(userA: string, userB: string): Promise<DirectMessage[]> {
    const list = await this.store.listDm(buildConversationId(userA, userB));
    return list.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }

  /** 標記訊息已讀。 */
  markDmRead(id: string, now: Date = new Date()): Promise<void> {
    return this.store.markDmRead(id, now);
  }

  /** 發布新內容版本（重拍某單元）。已購學員預設不動，除非 followLatest=true。 */
  async publishContentVersion(input: {
    tenantId: string;
    courseId: string;
    lessonSnapshots: Record<string, string>;
    changelog?: string;
    now?: Date;
  }): Promise<ContentVersion> {
    const existing = await this.store.listContentVersions(input.courseId);
    const nextVersion = (existing.reduce((m, v) => Math.max(m, v.version), 0)) + 1;
    const v: ContentVersion = {
      id: randomUUID(),
      tenantId: input.tenantId,
      courseId: input.courseId,
      version: nextVersion,
      lessonSnapshots: input.lessonSnapshots,
      publishedAt: input.now ?? new Date(),
      changelog: input.changelog,
    };
    await this.store.upsertContentVersion(v);
    return v;
  }

  /** 報名 enrollment 鎖定到當前最新版本。 */
  async lockEnrollmentToLatest(enrollmentId: string, courseId: string): Promise<EnrollmentVersionLock> {
    const versions = await this.store.listContentVersions(courseId);
    if (versions.length === 0) throw new Error('課程尚無已發布版本');
    const latest = versions.reduce((a, b) => (a.version > b.version ? a : b));
    const lock: EnrollmentVersionLock = {
      enrollmentId,
      courseId,
      lockedVersion: latest.version,
      followLatest: false,
    };
    await this.store.upsertEnrollmentLock(lock);
    return lock;
  }

  /** 學員選擇切到最新版（覆蓋鎖定）。 */
  async optInLatestVersion(enrollmentId: string): Promise<EnrollmentVersionLock> {
    const lock = await this.store.getEnrollmentLock(enrollmentId);
    if (!lock) throw new Error('找不到 enrollment 鎖定');
    const versions = await this.store.listContentVersions(lock.courseId);
    const latest = versions.reduce((a, b) => (a.version > b.version ? a : b));
    lock.lockedVersion = latest.version;
    lock.followLatest = true;
    await this.store.upsertEnrollmentLock(lock);
    return lock;
  }

  /** 取得學員當前該看的版本（給播放器用）。 */
  async resolveVersionForEnrollment(enrollmentId: string): Promise<ContentVersion> {
    const lock = await this.store.getEnrollmentLock(enrollmentId);
    if (!lock) throw new Error('找不到 enrollment 鎖定');
    const versions = await this.store.listContentVersions(lock.courseId);
    const target = lock.followLatest
      ? versions.reduce((a, b) => (a.version > b.version ? a : b))
      : versions.find((v) => v.version === lock.lockedVersion);
    if (!target) throw new Error(`找不到 version ${lock.lockedVersion}`);
    return target;
  }
}

function detectPeaks(
  series: number[],
  segments: EngagementSegment[],
  thresholdZ: number,
): SegmentRange[] {
  if (series.length === 0) return [];
  const mean = series.reduce((a, b) => a + b, 0) / series.length;
  const variance = series.reduce((a, b) => a + (b - mean) ** 2, 0) / series.length;
  const std = Math.sqrt(variance);
  if (std === 0) return [];
  const ranges: SegmentRange[] = [];
  let current: SegmentRange | undefined;
  for (let i = 0; i < series.length; i++) {
    const value = series[i] ?? 0;
    const seg = segments[i];
    if (!seg) continue;
    const z = (value - mean) / std;
    if (z >= thresholdZ) {
      if (current) {
        current.endSecond = seg.endSecond;
        current.intensity = Math.max(current.intensity, z);
      } else {
        current = { startSecond: seg.startSecond, endSecond: seg.endSecond, intensity: z };
      }
    } else if (current) {
      ranges.push(current);
      current = undefined;
    }
  }
  if (current) ranges.push(current);
  return ranges;
}

function buildConversationId(a: string, b: string): string {
  return a < b ? `${a}__${b}` : `${b}__${a}`;
}
