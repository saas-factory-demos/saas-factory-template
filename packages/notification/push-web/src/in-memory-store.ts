/**
 * 開發 / 測試用 in-memory subscription store。生產請改 DB 實作。
 */

import type { SubscriptionStore, WebPushSubscription } from './types.js';

/**
 * 以 Map 實作的測試用 store；保留每個 user 的多筆 subscription。
 */
export class InMemorySubscriptionStore implements SubscriptionStore {
  private readonly byUser = new Map<string, WebPushSubscription[]>();
  private readonly userByEndpoint = new Map<string, string>();

  add(userId: string, sub: WebPushSubscription): void {
    const list = this.byUser.get(userId) ?? [];
    if (!list.some((s) => s.endpoint === sub.endpoint)) {
      list.push(sub);
      this.byUser.set(userId, list);
      this.userByEndpoint.set(sub.endpoint, userId);
    }
  }

  listByUser(userId: string): WebPushSubscription[] {
    return this.byUser.get(userId) ?? [];
  }

  remove(endpoint: string): void {
    const userId = this.userByEndpoint.get(endpoint);
    if (!userId) return;
    const list = this.byUser.get(userId) ?? [];
    this.byUser.set(
      userId,
      list.filter((s) => s.endpoint !== endpoint),
    );
    this.userByEndpoint.delete(endpoint);
  }
}
