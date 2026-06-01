import type {
  LineFriend,
  PushJob,
  QuotaUsage,
  RichMenu,
  RichMenuSchedule,
} from './types.js';

export interface PushJobStore {
  insert(p: PushJob): Promise<void>;
  update(p: PushJob): Promise<void>;
  findById(id: string): Promise<PushJob | undefined>;
  listDue(tenantId: string, now: Date): Promise<PushJob[]>;
  listByTenant(tenantId: string): Promise<PushJob[]>;
}

export interface QuotaStore {
  /** 取本月使用量（不存在則 0）。 */
  getUsage(tenantId: string, yearMonth: string): Promise<QuotaUsage>;
  /** 累加使用量。 */
  addUsage(tenantId: string, yearMonth: string, n: number): Promise<QuotaUsage>;
}

export interface FriendStore {
  upsert(f: LineFriend): Promise<void>;
  findByLineUserId(tenantId: string, lineUserId: string): Promise<LineFriend | undefined>;
  /** 列出有效好友（followed 且未 blocked）。 */
  listActive(tenantId: string): Promise<LineFriend[]>;
}

export interface RichMenuStore {
  insert(m: RichMenu): Promise<void>;
  update(m: RichMenu): Promise<void>;
  findById(id: string): Promise<RichMenu | undefined>;
  listByTenant(tenantId: string): Promise<RichMenu[]>;
}

export interface RichMenuScheduleStore {
  insert(s: RichMenuSchedule): Promise<void>;
  update(s: RichMenuSchedule): Promise<void>;
  findById(id: string): Promise<RichMenuSchedule | undefined>;
  listByTenant(tenantId: string): Promise<RichMenuSchedule[]>;
}

export class InMemoryPushJobStore implements PushJobStore {
  private map = new Map<string, PushJob>();
  async insert(p: PushJob): Promise<void> {
    if (this.map.has(p.id)) throw new Error(`push job 已存在：${p.id}`);
    this.map.set(p.id, p);
  }
  async update(p: PushJob): Promise<void> {
    if (!this.map.has(p.id)) throw new Error(`push job 不存在：${p.id}`);
    this.map.set(p.id, p);
  }
  async findById(id: string): Promise<PushJob | undefined> {
    return this.map.get(id);
  }
  async listDue(tenantId: string, now: Date): Promise<PushJob[]> {
    return Array.from(this.map.values()).filter(
      (p) => p.tenantId === tenantId && p.status === 'scheduled' && p.scheduledAt <= now,
    );
  }
  async listByTenant(tenantId: string): Promise<PushJob[]> {
    return Array.from(this.map.values()).filter((p) => p.tenantId === tenantId);
  }
}

export class InMemoryQuotaStore implements QuotaStore {
  private map = new Map<string, QuotaUsage>();
  private key(tenantId: string, yearMonth: string): string {
    return `${tenantId}|${yearMonth}`;
  }
  async getUsage(tenantId: string, yearMonth: string): Promise<QuotaUsage> {
    return this.map.get(this.key(tenantId, yearMonth)) ?? { tenantId, yearMonth, used: 0 };
  }
  async addUsage(tenantId: string, yearMonth: string, n: number): Promise<QuotaUsage> {
    const cur = await this.getUsage(tenantId, yearMonth);
    const next: QuotaUsage = { ...cur, used: cur.used + n };
    this.map.set(this.key(tenantId, yearMonth), next);
    return next;
  }
}

export class InMemoryFriendStore implements FriendStore {
  private map = new Map<string, LineFriend>();
  private key(tenantId: string, lineUserId: string): string {
    return `${tenantId}|${lineUserId}`;
  }
  async upsert(f: LineFriend): Promise<void> {
    this.map.set(this.key(f.tenantId, f.lineUserId), f);
  }
  async findByLineUserId(tenantId: string, lineUserId: string): Promise<LineFriend | undefined> {
    return this.map.get(this.key(tenantId, lineUserId));
  }
  async listActive(tenantId: string): Promise<LineFriend[]> {
    return Array.from(this.map.values()).filter(
      (f) => f.tenantId === tenantId && !f.blocked && !f.unfollowedAt,
    );
  }
}

export class InMemoryRichMenuStore implements RichMenuStore {
  private map = new Map<string, RichMenu>();
  async insert(m: RichMenu): Promise<void> {
    if (this.map.has(m.id)) throw new Error(`rich menu 已存在：${m.id}`);
    this.map.set(m.id, m);
  }
  async update(m: RichMenu): Promise<void> {
    if (!this.map.has(m.id)) throw new Error(`rich menu 不存在：${m.id}`);
    this.map.set(m.id, m);
  }
  async findById(id: string): Promise<RichMenu | undefined> {
    return this.map.get(id);
  }
  async listByTenant(tenantId: string): Promise<RichMenu[]> {
    return Array.from(this.map.values()).filter((m) => m.tenantId === tenantId);
  }
}

export class InMemoryRichMenuScheduleStore implements RichMenuScheduleStore {
  private map = new Map<string, RichMenuSchedule>();
  async insert(s: RichMenuSchedule): Promise<void> {
    if (this.map.has(s.id)) throw new Error(`rich menu schedule 已存在：${s.id}`);
    this.map.set(s.id, s);
  }
  async update(s: RichMenuSchedule): Promise<void> {
    if (!this.map.has(s.id)) throw new Error(`rich menu schedule 不存在：${s.id}`);
    this.map.set(s.id, s);
  }
  async findById(id: string): Promise<RichMenuSchedule | undefined> {
    return this.map.get(id);
  }
  async listByTenant(tenantId: string): Promise<RichMenuSchedule[]> {
    return Array.from(this.map.values()).filter((s) => s.tenantId === tenantId);
  }
}
