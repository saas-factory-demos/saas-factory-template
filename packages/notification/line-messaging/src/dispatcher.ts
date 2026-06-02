/**
 * LINE Messaging API ChannelDispatcher。
 *
 * 使用官方 REST API（避免重 SDK 依賴）：
 * - Push: POST /v2/bot/message/push
 * - Multicast: POST /v2/bot/message/multicast
 * - Bearer Token 從 channel access token 來
 *
 * 規格出處：LINE Messaging API v3 reference。
 */

import type { LineMessage, LineTemplateRenderer } from './types.js';
import type {
  ChannelDispatcher,
  ChannelDispatchResult,
  NotificationPayload,
  UserNotificationProfile,
} from '@saas-factory/notifications';

export interface LineMessagingConfig {
  /** Messaging API channel access token */
  channelAccessToken: string;
  /** 模板渲染器 */
  renderer: LineTemplateRenderer;
  /** 注入 fetch（測試用） */
  fetchImpl?: typeof fetch;
  /** API base，可改 mock */
  apiBase?: string;
  /** userId 對映到 LINE userId 的 resolver；未提供時假設 profile.userId 即 LINE userId */
  resolveLineUserId?: (userId: string) => string | Promise<string>;
}

const DEFAULT_API_BASE = 'https://api.line.me';

/**
 * LINE Messaging API dispatcher。
 *
 * 用法：
 *   center.register(new LineMessagingDispatcher({ channelAccessToken, renderer }));
 */
export class LineMessagingDispatcher implements ChannelDispatcher {
  readonly channel = 'line' as const;

  constructor(private readonly config: LineMessagingConfig) {}

  async dispatch(
    payload: NotificationPayload,
    profile: UserNotificationProfile,
  ): Promise<ChannelDispatchResult> {
    const messages = this.config.renderer(payload.templateId, payload.data);
    if (messages.length === 0) {
      return { channel: 'line', status: 'skipped', reason: 'empty render' };
    }
    if (messages.length > 5) {
      return {
        channel: 'line',
        status: 'failed',
        reason: 'LINE push max 5 messages',
      };
    }
    const to = this.config.resolveLineUserId
      ? await this.config.resolveLineUserId(profile.userId)
      : profile.userId;
    try {
      const externalId = await this.push(to, messages);
      return { channel: 'line', status: 'sent', externalId };
    } catch (err) {
      return {
        channel: 'line',
        status: 'failed',
        reason: String(err instanceof Error ? err.message : err),
      };
    }
  }

  /** 直接 push 訊息給 user（給 caller 用，例如後台手動發送）。 */
  async push(to: string, messages: LineMessage[]): Promise<string> {
    const url = `${this.config.apiBase ?? DEFAULT_API_BASE}/v2/bot/message/push`;
    const fetchImpl = this.config.fetchImpl ?? fetch;
    const reqId = Math.random().toString(36).slice(2);
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.channelAccessToken}`,
        'X-Line-Retry-Key': reqId,
      },
      body: JSON.stringify({ to, messages }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LINE push ${res.status}: ${text}`);
    }
    return reqId;
  }

  /** Multicast（最多 500 個 userId）。 */
  async multicast(to: string[], messages: LineMessage[]): Promise<string> {
    if (to.length > 500) throw new Error('LINE multicast max 500 recipients');
    const url = `${this.config.apiBase ?? DEFAULT_API_BASE}/v2/bot/message/multicast`;
    const fetchImpl = this.config.fetchImpl ?? fetch;
    const reqId = Math.random().toString(36).slice(2);
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.channelAccessToken}`,
        'X-Line-Retry-Key': reqId,
      },
      body: JSON.stringify({ to, messages }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LINE multicast ${res.status}: ${text}`);
    }
    return reqId;
  }
}
