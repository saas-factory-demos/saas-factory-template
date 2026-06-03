import type {
  ContentVersion,
  DirectMessage,
  EnrollmentVersionLock,
  InstructorStore,
  PayoutRequest,
  RevenueEvent,
  WatchEvent,
} from './types.js';

/** 記憶體版 InstructorStore。 */
export class InMemoryInstructorStore implements InstructorStore {
  private readonly watchEvents: WatchEvent[] = [];
  private readonly revenueEvents: RevenueEvent[] = [];
  private readonly payouts = new Map<string, PayoutRequest>();
  private readonly dms = new Map<string, DirectMessage>();
  private readonly contentVersions = new Map<string, ContentVersion>();
  private readonly enrollmentLocks = new Map<string, EnrollmentVersionLock>();

  async appendWatchEvent(e: WatchEvent): Promise<void> {
    this.watchEvents.push(e);
  }

  async listWatchEvents(lessonId: string): Promise<WatchEvent[]> {
    return this.watchEvents.filter((e) => e.lessonId === lessonId);
  }

  async appendRevenueEvent(e: RevenueEvent): Promise<void> {
    this.revenueEvents.push(e);
  }

  async listRevenueEvents(instructorId: string, from: Date, to: Date): Promise<RevenueEvent[]> {
    return this.revenueEvents.filter(
      (e) =>
        e.instructorId === instructorId &&
        e.occurredAt.getTime() >= from.getTime() &&
        e.occurredAt.getTime() <= to.getTime(),
    );
  }

  async upsertPayout(p: PayoutRequest): Promise<void> {
    this.payouts.set(p.id, p);
  }

  async getPayout(id: string): Promise<PayoutRequest | undefined> {
    return this.payouts.get(id);
  }

  async listPayouts(instructorId: string): Promise<PayoutRequest[]> {
    return Array.from(this.payouts.values()).filter((p) => p.instructorId === instructorId);
  }

  async appendDm(m: DirectMessage): Promise<void> {
    this.dms.set(m.id, m);
  }

  async listDm(conversationId: string): Promise<DirectMessage[]> {
    return Array.from(this.dms.values()).filter((m) => m.conversationId === conversationId);
  }

  async markDmRead(id: string, readAt: Date): Promise<void> {
    const m = this.dms.get(id);
    if (m) {
      m.readAt = readAt;
      this.dms.set(id, m);
    }
  }

  async upsertContentVersion(v: ContentVersion): Promise<void> {
    this.contentVersions.set(v.id, v);
  }

  async listContentVersions(courseId: string): Promise<ContentVersion[]> {
    return Array.from(this.contentVersions.values()).filter((v) => v.courseId === courseId);
  }

  async upsertEnrollmentLock(lock: EnrollmentVersionLock): Promise<void> {
    this.enrollmentLocks.set(lock.enrollmentId, lock);
  }

  async getEnrollmentLock(enrollmentId: string): Promise<EnrollmentVersionLock | undefined> {
    return this.enrollmentLocks.get(enrollmentId);
  }
}
