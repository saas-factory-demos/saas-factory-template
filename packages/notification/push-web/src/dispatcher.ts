/**
 * Web Push ChannelDispatcher（PWA）。
 *
 * 採用 `web-push` 套件（peer dep）做 VAPID 簽章 + payload 加密。caller 注入 sender 函式
 * 讓本套件免於 hard require，方便測試以及讓 apps 自選底層套件。
 *
 * Lock：ADR-0011 §02-11 v1。
 */

import type {
  SubscriptionStore,
  WebPushPayload,
  WebPushSender,
  WebPushSubscription,
  WebPushTemplateRenderer,
} from './types.js';
import type {
  ChannelDispatcher,
  ChannelDispatchResult,
  NotificationPayload,
  UserNotificationProfile,
} from '@saas-factory/notifications';

export interface WebPushConfig {
  /** VAPID 公鑰 / 私鑰（base64-url）+ subject（mailto:）。 */
  vapid: { subject: string; publicKey: string; privateKey: string };
  /** subscription 倉庫 */
  store: SubscriptionStore;
  /** 訊息渲染器 */
  renderer: WebPushTemplateRenderer;
  /** 注入發送器（生產用 `web-push.sendNotification`） */
  sender: WebPushSender;
  /** 推播 TTL 秒（預設 86400 = 1 天） */
  ttlSeconds?: number;
}

/**
 * Web Push Dispatcher。
 *
 * 行為：
 * - 拉取該 user 所有 subscription（多裝置）
 * - 並行送出
 * - 任一裝置 410/404 → 從 store 移除（已退訂的瀏覽器）
 * - 全部失敗 → status='failed'；至少一個成功 → 'sent'；無 subscription → 'skipped'
 */
export class WebPushDispatcher implements ChannelDispatcher {
  readonly channel = 'push' as const;

  constructor(private readonly config: WebPushConfig) {}

  async dispatch(
    payload: NotificationPayload,
    profile: UserNotificationProfile,
  ): Promise<ChannelDispatchResult> {
    const subs = await this.config.store.listByUser(profile.userId);
    if (subs.length === 0) {
      return { channel: 'push', status: 'skipped', reason: 'no subscriptions' };
    }
    const message = this.config.renderer(payload.templateId, payload.data);
    const results = await Promise.all(
      subs.map((s) => this.sendOne(s, message)),
    );
    const anySent = results.some((r) => r.ok);
    if (anySent) {
      return {
        channel: 'push',
        status: 'sent',
        externalId: `push:${profile.userId}:${results.filter((r) => r.ok).length}`,
      };
    }
    return {
      channel: 'push',
      status: 'failed',
      reason: results.map((r) => r.reason).join('; ') || 'all failed',
    };
  }

  private async sendOne(
    sub: WebPushSubscription,
    payload: WebPushPayload,
  ): Promise<{ ok: boolean; reason?: string }> {
    try {
      const res = await this.config.sender(sub, JSON.stringify(payload), {
        vapidDetails: this.config.vapid,
        TTL: this.config.ttlSeconds ?? 86400,
      });
      const code = res?.statusCode ?? 200;
      if (code === 410 || code === 404) {
        await this.config.store.remove(sub.endpoint);
        return { ok: false, reason: `gone (${code})` };
      }
      if (code >= 400) return { ok: false, reason: `http ${code}` };
      return { ok: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // web-push 將 410/404 包成 WebPushError，message 含 status
      if (msg.includes('410') || msg.includes('404')) {
        await this.config.store.remove(sub.endpoint);
        return { ok: false, reason: 'gone' };
      }
      return { ok: false, reason: msg };
    }
  }
}
