/**
 * Web Push subscription / payload 型別。
 *
 * 規格：W3C Push API + RFC 8030 + VAPID (RFC 8292)。
 */

/** Browser Push Subscription（PushSubscription.toJSON() 的結果）。 */
export interface WebPushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/** 訂閱倉庫：apps 端注入；通常存到 DB。 */
export interface SubscriptionStore {
  /** 取得某 user 的所有 subscriptions（多裝置） */
  listByUser(userId: string): Promise<WebPushSubscription[]> | WebPushSubscription[];
  /** 移除無效 subscription（410 / 404）。 */
  remove(endpoint: string): Promise<void> | void;
}

/** 推播訊息內容（serializeable）。 */
export interface WebPushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  /** 任意自訂資料 → 走到 service worker `event.data.json().data` */
  data?: Record<string, unknown>;
  tag?: string;
  /** 振動模式（毫秒） */
  vibrate?: number[];
}

/** 模板渲染器 */
export type WebPushTemplateRenderer = (
  templateId: string,
  data: Record<string, unknown>,
) => WebPushPayload;

/** sendNotification 簽章（與 `web-push` 套件一致），抽象出來方便測試注入。 */
export type WebPushSender = (
  subscription: WebPushSubscription,
  payload: string,
  options: {
    vapidDetails: { subject: string; publicKey: string; privateKey: string };
    TTL?: number;
  },
) => Promise<{ statusCode: number; body?: string } | undefined>;
