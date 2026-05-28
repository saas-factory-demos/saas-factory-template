import type {
  EmailCampaign,
  EmailEvent,
  EmailSend,
  Unsubscribe,
} from './types.js';

export interface CampaignStore {
  insert(c: EmailCampaign): Promise<void>;
  update(c: EmailCampaign): Promise<void>;
  findById(id: string): Promise<EmailCampaign | undefined>;
  listDue(tenantId: string, now: Date): Promise<EmailCampaign[]>;
}

export interface SendStore {
  insert(s: EmailSend): Promise<void>;
  update(s: EmailSend): Promise<void>;
  findById(id: string): Promise<EmailSend | undefined>;
  listByCampaign(campaignId: string): Promise<EmailSend[]>;
  /** 同 email 在時間窗內 sent 次數。 */
  countSentForEmailInWindow(
    tenantId: string,
    email: string,
    since: Date,
  ): Promise<number>;
}

export interface EmailEventStore {
  insert(e: EmailEvent): Promise<void>;
  listBySend(sendId: string): Promise<EmailEvent[]>;
  listByCampaign(campaignId: string): Promise<EmailEvent[]>;
}

export interface UnsubscribeStore {
  insert(u: Unsubscribe): Promise<void>;
  has(tenantId: string, email: string): Promise<boolean>;
  listByTenant(tenantId: string): Promise<Unsubscribe[]>;
}

export class InMemoryCampaignStore implements CampaignStore {
  private map = new Map<string, EmailCampaign>();
  async insert(c: EmailCampaign): Promise<void> {
    if (this.map.has(c.id)) throw new Error(`campaign 已存在：${c.id}`);
    this.map.set(c.id, c);
  }
  async update(c: EmailCampaign): Promise<void> {
    if (!this.map.has(c.id)) throw new Error(`campaign 不存在：${c.id}`);
    this.map.set(c.id, c);
  }
  async findById(id: string): Promise<EmailCampaign | undefined> {
    return this.map.get(id);
  }
  async listDue(tenantId: string, now: Date): Promise<EmailCampaign[]> {
    return Array.from(this.map.values()).filter(
      (c) => c.tenantId === tenantId && c.status === 'scheduled' && c.scheduledAt <= now,
    );
  }
}

export class InMemorySendStore implements SendStore {
  private map = new Map<string, EmailSend>();
  async insert(s: EmailSend): Promise<void> {
    if (this.map.has(s.id)) throw new Error(`send 已存在：${s.id}`);
    this.map.set(s.id, s);
  }
  async update(s: EmailSend): Promise<void> {
    if (!this.map.has(s.id)) throw new Error(`send 不存在：${s.id}`);
    this.map.set(s.id, s);
  }
  async findById(id: string): Promise<EmailSend | undefined> {
    return this.map.get(id);
  }
  async listByCampaign(campaignId: string): Promise<EmailSend[]> {
    return Array.from(this.map.values()).filter((s) => s.campaignId === campaignId);
  }
  async countSentForEmailInWindow(
    tenantId: string,
    email: string,
    since: Date,
  ): Promise<number> {
    return Array.from(this.map.values()).filter(
      (s) =>
        s.tenantId === tenantId &&
        s.toEmail === email &&
        s.status === 'sent' &&
        s.sentAt !== undefined &&
        s.sentAt >= since,
    ).length;
  }
}

export class InMemoryEmailEventStore implements EmailEventStore {
  private list: EmailEvent[] = [];
  async insert(e: EmailEvent): Promise<void> {
    this.list.push(e);
  }
  async listBySend(sendId: string): Promise<EmailEvent[]> {
    return this.list.filter((e) => e.sendId === sendId);
  }
  async listByCampaign(campaignId: string): Promise<EmailEvent[]> {
    return this.list.filter((e) => e.sendId.startsWith(`${campaignId}:`));
  }
}

export class InMemoryUnsubscribeStore implements UnsubscribeStore {
  private list: Unsubscribe[] = [];
  async insert(u: Unsubscribe): Promise<void> {
    if (this.list.some((x) => x.tenantId === u.tenantId && x.email === u.email)) return;
    this.list.push(u);
  }
  async has(tenantId: string, email: string): Promise<boolean> {
    return this.list.some((u) => u.tenantId === tenantId && u.email === email);
  }
  async listByTenant(tenantId: string): Promise<Unsubscribe[]> {
    return this.list.filter((u) => u.tenantId === tenantId);
  }
}
