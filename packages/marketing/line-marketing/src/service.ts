import { randomBytes } from 'node:crypto';

import { nextScheduleStatus, yearMonthOf } from './helpers.js';

import type {
  FriendStore,
  PushJobStore,
  QuotaStore,
  RichMenuScheduleStore,
  RichMenuStore,
} from './in-memory-store.js';
import type {
  LineFriend,
  LineMessage,
  LinePushHandler,
  LineSegmentResolver,
  PushJob,
  PushTarget,
  QuotaPolicy,
  RichMenu,
  RichMenuSchedule,
} from './types.js';

export { yearMonthOf };

/** LINE 行銷服務。 */
export class LineMarketingService {
  constructor(
    private readonly pushJobs: PushJobStore,
    private readonly quota: QuotaStore,
    private readonly friends: FriendStore,
    private readonly richMenus: RichMenuStore,
    private readonly richMenuSchedules: RichMenuScheduleStore,
    private readonly handlers: {
      pusher: LinePushHandler;
      resolveSegment: LineSegmentResolver;
    },
    private readonly policy: QuotaPolicy,
    private readonly options: { now?: () => Date; genId?: () => string } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(prefix: string): string {
    if (this.options.genId) return this.options.genId();
    return `${prefix}_${randomBytes(5).toString('hex')}`;
  }

  /** 估算 push 目標數（用於配額預扣）。 */
  private async estimateTargetCount(tenantId: string, target: PushTarget): Promise<number> {
    if (target.kind === 'broadcast') {
      const active = await this.friends.listActive(tenantId);
      return active.length;
    }
    if (target.kind === 'multicast') return target.userIds.length;
    const ids = await this.handlers.resolveSegment(tenantId, target.segmentId);
    return ids.length;
  }

  /** 建立 push job（draft）。 */
  async createJob(input: {
    tenantId: string;
    name: string;
    target: PushTarget;
    messages: LineMessage[];
    scheduledAt: Date;
  }): Promise<PushJob> {
    if (input.messages.length === 0) throw new Error('messages 不可為空');
    if (input.messages.length > 5) throw new Error('單次 push 最多 5 則訊息');
    const job: PushJob = {
      id: this.genId('pj'),
      tenantId: input.tenantId,
      name: input.name,
      target: input.target,
      messages: input.messages,
      scheduledAt: input.scheduledAt,
      status: 'draft',
      createdAt: this.now(),
    };
    await this.pushJobs.insert(job);
    return job;
  }

  /** 確認排程（draft → scheduled），同時估算 estimatedMessages。 */
  async scheduleJob(jobId: string): Promise<PushJob> {
    const j = await this.pushJobs.findById(jobId);
    if (!j) throw new Error(`找不到 push job：${jobId}`);
    if (j.status !== 'draft') throw new Error(`狀態錯誤：${j.status}`);
    const targets = await this.estimateTargetCount(j.tenantId, j.target);
    const estimatedMessages = targets * j.messages.length;
    // 預檢：broadcast 在配額 floor 之下禁止
    if (j.target.kind === 'broadcast') {
      const ym = yearMonthOf(j.scheduledAt);
      const usage = await this.quota.getUsage(j.tenantId, ym);
      const remaining = this.policy.monthlyLimit - usage.used;
      const floor = this.policy.monthlyLimit * this.policy.broadcastFloorRatio;
      if (remaining < floor) {
        throw new Error('剩餘配額低於 broadcast floor，禁止全體推播');
      }
    }
    const updated: PushJob = { ...j, status: 'scheduled', estimatedMessages };
    await this.pushJobs.update(updated);
    return updated;
  }

  /** 取消 push job。 */
  async cancelJob(jobId: string): Promise<PushJob> {
    const j = await this.pushJobs.findById(jobId);
    if (!j) throw new Error(`找不到 push job：${jobId}`);
    if (j.status !== 'draft' && j.status !== 'scheduled') {
      throw new Error(`不可取消狀態：${j.status}`);
    }
    const updated: PushJob = { ...j, status: 'cancelled' };
    await this.pushJobs.update(updated);
    return updated;
  }

  /** Cron：抓 due 的 scheduled job 寄出。 */
  async dispatchDue(tenantId: string, now: Date = this.now()): Promise<PushJob[]> {
    const due = await this.pushJobs.listDue(tenantId, now);
    const out: PushJob[] = [];
    for (const j of due) {
      out.push(await this.runJob(j.id));
    }
    return out;
  }

  /** 立即執行 push job。 */
  async runJob(jobId: string): Promise<PushJob> {
    const j = await this.pushJobs.findById(jobId);
    if (!j) throw new Error(`找不到 push job：${jobId}`);
    if (j.status === 'sent' || j.status === 'cancelled' || j.status === 'failed') return j;
    const startedAt = this.now();
    await this.pushJobs.update({ ...j, status: 'sending', startedAt });

    const ym = yearMonthOf(startedAt);
    const usage = await this.quota.getUsage(j.tenantId, ym);
    const targetCount = await this.estimateTargetCount(j.tenantId, j.target);
    const projected = targetCount * j.messages.length;
    if (usage.used + projected > this.policy.monthlyLimit) {
      const failed: PushJob = {
        ...j,
        status: 'failed',
        startedAt,
        completedAt: this.now(),
        error: '本月配額不足',
      };
      await this.pushJobs.update(failed);
      return failed;
    }

    const result = await this.handlers.pusher.push({
      target: j.target,
      messages: j.messages,
    });
    if (result.ok) {
      await this.quota.addUsage(j.tenantId, ym, result.sentCount);
      const done: PushJob = {
        ...j,
        status: 'sent',
        startedAt,
        completedAt: this.now(),
        sentMessages: result.sentCount,
      };
      await this.pushJobs.update(done);
      return done;
    }
    const failed: PushJob = {
      ...j,
      status: 'failed',
      startedAt,
      completedAt: this.now(),
      error: result.error,
    };
    await this.pushJobs.update(failed);
    return failed;
  }

  /** 好友 follow webhook。 */
  async onFollow(input: {
    tenantId: string;
    lineUserId: string;
    displayName?: string;
    customerId?: string;
    at?: Date;
  }): Promise<LineFriend> {
    const existing = await this.friends.findByLineUserId(input.tenantId, input.lineUserId);
    const friend: LineFriend = {
      tenantId: input.tenantId,
      lineUserId: input.lineUserId,
      displayName: input.displayName ?? existing?.displayName,
      customerId: input.customerId ?? existing?.customerId,
      followedAt: existing?.followedAt ?? input.at ?? this.now(),
      blocked: false,
      unfollowedAt: undefined,
    };
    await this.friends.upsert(friend);
    return friend;
  }

  /** 好友 unfollow webhook。 */
  async onUnfollow(input: {
    tenantId: string;
    lineUserId: string;
    at?: Date;
  }): Promise<LineFriend | undefined> {
    const cur = await this.friends.findByLineUserId(input.tenantId, input.lineUserId);
    if (!cur) return undefined;
    const updated: LineFriend = {
      ...cur,
      blocked: true,
      unfollowedAt: input.at ?? this.now(),
    };
    await this.friends.upsert(updated);
    return updated;
  }

  /** 綁定顧客（從 LINE login 或會員中心連結）。 */
  async linkCustomer(input: {
    tenantId: string;
    lineUserId: string;
    customerId: string;
  }): Promise<LineFriend> {
    const cur = await this.friends.findByLineUserId(input.tenantId, input.lineUserId);
    if (!cur) throw new Error(`找不到 LINE 好友：${input.lineUserId}`);
    const updated: LineFriend = { ...cur, customerId: input.customerId };
    await this.friends.upsert(updated);
    return updated;
  }

  /** 建立 rich menu。 */
  async createRichMenu(input: Omit<RichMenu, 'id' | 'createdAt' | 'status'>): Promise<RichMenu> {
    const m: RichMenu = {
      ...input,
      id: this.genId('rm'),
      status: 'draft',
      createdAt: this.now(),
    };
    await this.richMenus.insert(m);
    return m;
  }

  /** 發佈 rich menu（draft → published）。 */
  async publishRichMenu(id: string): Promise<RichMenu> {
    const m = await this.richMenus.findById(id);
    if (!m) throw new Error(`找不到 rich menu：${id}`);
    if (m.status === 'archived') throw new Error('已封存無法發佈');
    const updated: RichMenu = { ...m, status: 'published' };
    await this.richMenus.update(updated);
    return updated;
  }

  /** 排程 rich menu 切換。 */
  async scheduleRichMenu(input: Omit<RichMenuSchedule, 'id' | 'status'>): Promise<RichMenuSchedule> {
    if (input.until && input.until <= input.from) {
      throw new Error('until 必須晚於 from');
    }
    const s: RichMenuSchedule = {
      ...input,
      id: this.genId('rms'),
      status: 'pending',
    };
    await this.richMenuSchedules.insert(s);
    return s;
  }

  /** Cron：滾動 rich menu schedule 狀態。 */
  async tickRichMenuSchedules(tenantId: string, now: Date = this.now()): Promise<RichMenuSchedule[]> {
    const list = await this.richMenuSchedules.listByTenant(tenantId);
    const out: RichMenuSchedule[] = [];
    for (const s of list) {
      const next = nextScheduleStatus(s, now);
      if (next === s.status) {
        out.push(s);
        continue;
      }
      const updated: RichMenuSchedule = { ...s, status: next };
      await this.richMenuSchedules.update(updated);
      out.push(updated);
    }
    return out;
  }

  /** 取本月配額用量。 */
  async getMonthlyUsage(
    tenantId: string,
    at: Date = this.now(),
  ): Promise<{ used: number; limit: number; remaining: number; yearMonth: string }> {
    const ym = yearMonthOf(at);
    const u = await this.quota.getUsage(tenantId, ym);
    return {
      used: u.used,
      limit: this.policy.monthlyLimit,
      remaining: this.policy.monthlyLimit - u.used,
      yearMonth: ym,
    };
  }
}
