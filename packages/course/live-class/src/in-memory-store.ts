import type { LiveSession, LiveSessionStore } from './types.js';

/** 記憶體版 LiveSessionStore。 */
export class InMemoryLiveSessionStore implements LiveSessionStore {
  private readonly data = new Map<string, LiveSession>();

  async get(id: string): Promise<LiveSession | undefined> {
    return this.data.get(id);
  }
  async upsert(s: LiveSession): Promise<void> {
    this.data.set(s.id, s);
  }
  async listByCourse(tenantId: string, courseId: string): Promise<LiveSession[]> {
    return Array.from(this.data.values()).filter(
      (s) => s.tenantId === tenantId && s.courseId === courseId,
    );
  }
}
