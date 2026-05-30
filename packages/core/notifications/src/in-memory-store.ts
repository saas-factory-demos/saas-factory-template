import type { NotificationStore } from './center.js';
import type { NotificationRecord } from './types.js';

/**
 * 測試 / 開發用 in-memory store。Production 走 Payload Collection 實作。
 */
export class InMemoryNotificationStore implements NotificationStore {
  private readonly records: NotificationRecord[] = [];

  recent(
    userId: string,
    templateId: string,
    sinceMs: number,
  ): Promise<NotificationRecord[]> {
    const cutoff = Date.now() - sinceMs;
    return Promise.resolve(
      this.records.filter(
        (r) =>
          r.userId === userId &&
          r.templateId === templateId &&
          new Date(r.createdAt).getTime() >= cutoff &&
          r.status === 'sent',
      ),
    );
  }

  save(record: NotificationRecord): Promise<void> {
    this.records.push(record);
    return Promise.resolve();
  }

  listUnread(userId: string): Promise<NotificationRecord[]> {
    return Promise.resolve(
      this.records.filter((r) => r.userId === userId && !r.readAt),
    );
  }

  markRead(notificationId: string): Promise<void> {
    const rec = this.records.find((r) => r.id === notificationId);
    if (rec) {
      rec.readAt = new Date().toISOString();
    }
    return Promise.resolve();
  }

  all(): NotificationRecord[] {
    return [...this.records];
  }
}
