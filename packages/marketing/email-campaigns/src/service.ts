import { randomBytes } from 'node:crypto';

import type {
  CampaignStore,
  EmailEventStore,
  SendStore,
  UnsubscribeStore,
} from './in-memory-store.js';
import type {
  CampaignStats,
  EmailCampaign,
  EmailEventKind,
  EmailSend,
  EmailSenderHandler,
  FrequencyPolicy,
} from './types.js';

const HOUR = 60 * 60 * 1000;

/** 取得 segment 內 email 名單（注入函式，避免硬綁 segments 套件）。 */
export type SegmentResolver = (
  tenantId: string,
  segmentId: string,
) => Promise<Array<{ customerId: string; email: string }>>;

/** Email Campaign 服務。 */
export class EmailCampaignService {
  constructor(
    private readonly campaigns: CampaignStore,
    private readonly sends: SendStore,
    private readonly events: EmailEventStore,
    private readonly unsubs: UnsubscribeStore,
    private readonly handlers: {
      sender: EmailSenderHandler;
      resolveSegment: SegmentResolver;
    },
    private readonly policy: FrequencyPolicy,
    private readonly options: { now?: () => Date; genId?: () => string } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(prefix: string): string {
    if (this.options.genId) return this.options.genId();
    return `${prefix}_${randomBytes(5).toString('hex')}`;
  }

  /** 建立 campaign。預設 draft；scheduledAt 指定後 schedule。 */
  async create(
    input: Omit<EmailCampaign, 'id' | 'status' | 'createdAt'>,
  ): Promise<EmailCampaign> {
    const c: EmailCampaign = {
      ...input,
      id: this.genId('cp'),
      status: 'draft',
      createdAt: this.now(),
    };
    await this.campaigns.insert(c);
    return c;
  }

  /** 確認 schedule（draft → scheduled）。 */
  async schedule(campaignId: string): Promise<EmailCampaign> {
    const c = await this.campaigns.findById(campaignId);
    if (!c) throw new Error(`找不到 campaign：${campaignId}`);
    if (c.status !== 'draft') throw new Error(`狀態錯誤：${c.status}`);
    const updated: EmailCampaign = { ...c, status: 'scheduled' };
    await this.campaigns.update(updated);
    return updated;
  }

  /** 取消（只允許 draft/scheduled）。 */
  async cancel(campaignId: string): Promise<EmailCampaign> {
    const c = await this.campaigns.findById(campaignId);
    if (!c) throw new Error(`找不到 campaign：${campaignId}`);
    if (c.status !== 'draft' && c.status !== 'scheduled') {
      throw new Error(`不可取消狀態：${c.status}`);
    }
    const updated: EmailCampaign = { ...c, status: 'cancelled' };
    await this.campaigns.update(updated);
    return updated;
  }

  /** Cron：抓 due 的 scheduled campaign 寄出。 */
  async dispatchDue(tenantId: string, now: Date = this.now()): Promise<EmailCampaign[]> {
    const due = await this.campaigns.listDue(tenantId, now);
    const out: EmailCampaign[] = [];
    for (const c of due) {
      out.push(await this.runCampaign(c.id));
    }
    return out;
  }

  /** 立即執行某 campaign（無視 scheduledAt）。 */
  async runCampaign(campaignId: string): Promise<EmailCampaign> {
    const c = await this.campaigns.findById(campaignId);
    if (!c) throw new Error(`找不到 campaign：${campaignId}`);
    if (c.status === 'sent' || c.status === 'cancelled') return c;
    const startedAt = this.now();
    await this.campaigns.update({ ...c, status: 'sending', startedAt });

    const audience = await this.handlers.resolveSegment(c.tenantId, c.segmentId);
    const windowStart = new Date(startedAt.getTime() - this.policy.windowHours * HOUR);

    for (const r of audience) {
      const send: EmailSend = {
        id: this.genId('sd'),
        campaignId: c.id,
        tenantId: c.tenantId,
        customerId: r.customerId,
        toEmail: r.email,
        status: 'pending',
      };
      // 退訂直接 skip
      if (await this.unsubs.has(c.tenantId, r.email)) {
        send.status = 'skipped';
        send.skipReason = 'unsubscribed';
        await this.sends.insert(send);
        continue;
      }
      // 頻率上限
      const recentCount = await this.sends.countSentForEmailInWindow(
        c.tenantId,
        r.email,
        windowStart,
      );
      if (recentCount >= this.policy.maxEmailsInWindow) {
        send.status = 'skipped';
        send.skipReason = 'frequency-cap';
        await this.sends.insert(send);
        continue;
      }
      const result = await this.handlers.sender.send({
        toEmail: r.email,
        fromEmail: c.fromEmail,
        fromName: c.fromName,
        subject: c.subject,
        bodyHtml: c.bodyHtml,
        bodyText: c.bodyText,
      });
      if (result.ok) {
        send.status = 'sent';
        send.sentAt = this.now();
        send.providerMessageId = result.providerMessageId;
      } else {
        send.status = 'failed';
        send.error = result.error;
      }
      await this.sends.insert(send);
    }

    const completedAt = this.now();
    const updated: EmailCampaign = { ...c, status: 'sent', startedAt, completedAt };
    await this.campaigns.update(updated);
    return updated;
  }

  /** Provider webhook → 寫 event。 */
  async recordProviderEvent(
    sendId: string,
    kind: EmailEventKind,
    at: Date,
    url?: string,
  ): Promise<void> {
    const send = await this.sends.findById(sendId);
    if (!send) throw new Error(`找不到 send：${sendId}`);
    await this.events.insert({
      id: this.genId('ev'),
      sendId,
      kind,
      at,
      url,
    });
    if (kind === 'bounced') {
      await this.sends.update({ ...send, status: 'bounced' });
    }
  }

  /** 退訂登錄。 */
  async unsubscribe(input: {
    tenantId: string;
    email: string;
    fromCampaignId?: string;
    at?: Date;
  }): Promise<void> {
    await this.unsubs.insert({
      tenantId: input.tenantId,
      email: input.email,
      at: input.at ?? this.now(),
      fromCampaignId: input.fromCampaignId,
    });
  }

  /** Campaign 統計。 */
  async stats(campaignId: string): Promise<CampaignStats> {
    const sends = await this.sends.listByCampaign(campaignId);
    const sent = sends.filter((s) => s.status === 'sent').length;
    let delivered = 0;
    let opened = 0;
    let clicked = 0;
    let bounced = 0;
    let unsubscribed = 0;
    const openedSends = new Set<string>();
    const clickedSends = new Set<string>();
    for (const s of sends) {
      const evs = await this.events.listBySend(s.id);
      for (const e of evs) {
        if (e.kind === 'delivered') delivered++;
        else if (e.kind === 'opened') {
          if (!openedSends.has(s.id)) {
            openedSends.add(s.id);
            opened++;
          }
        } else if (e.kind === 'clicked') {
          if (!clickedSends.has(s.id)) {
            clickedSends.add(s.id);
            clicked++;
          }
        } else if (e.kind === 'bounced') bounced++;
        else if (e.kind === 'complained') unsubscribed++;
      }
    }
    const rate = (n: number): number => (sent === 0 ? 0 : n / sent);
    return {
      campaignId,
      sent,
      delivered,
      opened,
      clicked,
      bounced,
      unsubscribed,
      openRate: rate(opened),
      clickRate: rate(clicked),
      bounceRate: rate(bounced),
      unsubscribeRate: rate(unsubscribed),
    };
  }
}
