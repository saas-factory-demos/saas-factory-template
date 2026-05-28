import type { DeviceSession, DeviceSessionStore } from './types.js';

/** 記憶體版 DeviceSessionStore（測試 / dev 用）。 */
export class InMemoryDeviceSessionStore implements DeviceSessionStore {
  private readonly data = new Map<string, DeviceSession>();

  async list(tenantId: string, userId: string): Promise<DeviceSession[]> {
    return Array.from(this.data.values()).filter(
      (s) => s.tenantId === tenantId && s.userId === userId,
    );
  }

  async get(id: string): Promise<DeviceSession | undefined> {
    return this.data.get(id);
  }

  async upsert(session: DeviceSession): Promise<void> {
    this.data.set(session.id, session);
  }

  async delete(id: string): Promise<void> {
    this.data.delete(id);
  }
}
