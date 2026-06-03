import { randomBytes } from 'node:crypto';

import { evalPredicate } from './predicate.js';

import type { CustomerProfileStore, SegmentStore } from './in-memory-store.js';
import type {
  CustomerProfile,
  Predicate,
  PushChannel,
  Segment,
  SegmentMembership,
} from './types.js';

/** Segment 服務（動態分群 + 推播通道過濾）。 */
export class SegmentService {
  constructor(
    private readonly segments: SegmentStore,
    private readonly profiles: CustomerProfileStore,
    private readonly options: { now?: () => Date; genId?: () => string } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(): string {
    if (this.options.genId) return this.options.genId();
    return `sg_${randomBytes(5).toString('hex')}`;
  }

  /** 建立 segment。 */
  async create(input: {
    tenantId: string;
    name: string;
    predicate: Predicate;
    dynamic?: boolean;
  }): Promise<Segment> {
    const s: Segment = {
      id: this.genId(),
      tenantId: input.tenantId,
      name: input.name,
      predicate: input.predicate,
      dynamic: input.dynamic ?? true,
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    await this.segments.insert(s);
    return s;
  }

  /** 更新 predicate（動態 segment 立即反映）。 */
  async updatePredicate(segmentId: string, predicate: Predicate): Promise<Segment> {
    const s = await this.segments.findById(segmentId);
    if (!s) throw new Error(`找不到 segment：${segmentId}`);
    const updated: Segment = { ...s, predicate, updatedAt: this.now() };
    await this.segments.update(updated);
    return updated;
  }

  /** 評估 segment：算出符合 predicate 的所有客戶。 */
  async evaluate(segmentId: string, now: Date = this.now()): Promise<SegmentMembership> {
    const s = await this.segments.findById(segmentId);
    if (!s) throw new Error(`找不到 segment：${segmentId}`);
    const all = await this.profiles.listByTenant(s.tenantId);
    const members = all.filter((p) => evalPredicate(s.predicate, p, now));
    return { segmentId: s.id, members };
  }

  /** 取得可推送某通道的成員（過濾 consents）。 */
  async listPushTargets(
    segmentId: string,
    channel: PushChannel,
    now: Date = this.now(),
  ): Promise<CustomerProfile[]> {
    const { members } = await this.evaluate(segmentId, now);
    return members.filter((m) => m.consents?.[channel] !== false);
  }

  /** 判斷客戶是否屬於 segment（即時）。 */
  async isMember(segmentId: string, customerId: string, now: Date = this.now()): Promise<boolean> {
    const s = await this.segments.findById(segmentId);
    if (!s) return false;
    const p = await this.profiles.get(s.tenantId, customerId);
    if (!p) return false;
    return evalPredicate(s.predicate, p, now);
  }
}
