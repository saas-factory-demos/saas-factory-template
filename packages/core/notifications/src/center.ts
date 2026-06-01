import type {
  ChannelDispatchResult,
  ChannelDispatcher,
  NotificationChannel,
  NotificationPayload,
  NotificationRecord,
  UserNotificationProfile,
} from './types.js';

/**
 * NotificationCenter（goal 01 §7）。
 *
 * 對外只有一個 `send`，內部依 channels 路由到各 dispatcher，並套用：
 *   1. 行銷類強制檢查 marketingConsent[channel]
 *   2. 個人 preferences 開關
 *   3. dedupe（templateId + userId + window）
 */
export interface NotificationStore {
  recent(
    userId: string,
    templateId: string,
    sinceMs: number,
  ): Promise<NotificationRecord[]>;
  save(record: NotificationRecord): Promise<void>;
  listUnread(userId: string): Promise<NotificationRecord[]>;
  markRead(notificationId: string): Promise<void>;
}

export interface ProfileResolver {
  get(userId: string): Promise<UserNotificationProfile>;
}

export interface NotificationCenterConfig {
  dispatchers: ChannelDispatcher[];
  store: NotificationStore;
  profileResolver: ProfileResolver;
  /** 預設 id 產生器（test 可注入確定值） */
  idGenerator?: () => string;
}

export class NotificationCenter {
  private readonly byChannel: Map<NotificationChannel, ChannelDispatcher>;
  private readonly store: NotificationStore;
  private readonly profileResolver: ProfileResolver;
  private readonly idGenerator: () => string;

  constructor(config: NotificationCenterConfig) {
    this.byChannel = new Map(config.dispatchers.map((d) => [d.channel, d]));
    this.store = config.store;
    this.profileResolver = config.profileResolver;
    this.idGenerator =
      config.idGenerator ??
      (() => `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  }

  async send(payload: NotificationPayload): Promise<ChannelDispatchResult[]> {
    const profile = await this.profileResolver.get(payload.userId);

    // dedupe
    if (payload.dedupeWindowMs && payload.dedupeWindowMs > 0) {
      const recent = await this.store.recent(
        payload.userId,
        payload.templateId,
        payload.dedupeWindowMs,
      );
      if (recent.length > 0) {
        const skipped: ChannelDispatchResult[] = payload.channels.map(
          (channel) => ({ channel, status: 'skipped', reason: 'deduped' }),
        );
        for (const result of skipped) {
          await this.store.save({
            id: this.idGenerator(),
            userId: payload.userId,
            tenantId: payload.tenantId,
            templateId: payload.templateId,
            channel: result.channel,
            category: payload.category,
            status: result.status,
            reason: result.reason,
            createdAt: new Date().toISOString(),
          });
        }
        return skipped;
      }
    }

    const results: ChannelDispatchResult[] = [];
    for (const channel of payload.channels) {
      const result = await this.dispatchOne(channel, payload, profile);
      results.push(result);
      await this.store.save({
        id: this.idGenerator(),
        userId: payload.userId,
        tenantId: payload.tenantId,
        templateId: payload.templateId,
        channel,
        category: payload.category,
        status: result.status,
        reason: result.reason,
        createdAt: new Date().toISOString(),
      });
    }
    return results;
  }

  private async dispatchOne(
    channel: NotificationChannel,
    payload: NotificationPayload,
    profile: UserNotificationProfile,
  ): Promise<ChannelDispatchResult> {
    // 個人偏好（in-app / security 強制送）
    const pref = profile.preferences?.[channel];
    if (pref === false && payload.category !== 'security') {
      return { channel, status: 'skipped', reason: 'user disabled' };
    }

    // 行銷類同意
    if (payload.category === 'marketing' && channel !== 'in-app') {
      const consentKey = channel as keyof typeof profile.consent;
      if (!profile.consent[consentKey]) {
        return { channel, status: 'skipped', reason: 'no marketing consent' };
      }
    }

    const dispatcher = this.byChannel.get(channel);
    if (!dispatcher) {
      return {
        channel,
        status: 'failed',
        reason: `no dispatcher for ${channel}`,
      };
    }

    try {
      return await dispatcher.dispatch(payload, profile);
    } catch (err) {
      return {
        channel,
        status: 'failed',
        reason: err instanceof Error ? err.message : String(err),
      };
    }
  }

  getUnread(userId: string): Promise<NotificationRecord[]> {
    return this.store.listUnread(userId);
  }

  markRead(notificationId: string): Promise<void> {
    return this.store.markRead(notificationId);
  }
}
