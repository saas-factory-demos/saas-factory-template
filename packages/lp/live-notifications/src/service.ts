import type {
  LiveNotificationConfig,
  NotificationPayload,
  RealOrderSnapshot,
} from './types.js';

/** 真實訂單來源（由外層注入 orders 套件）。 */
export type RealOrderSource = (input: {
  tenantId: string;
  productIds?: string[];
  sinceMinutes: number;
}) => Promise<RealOrderSnapshot[]>;

/** 即時通知服務。負責產出下一筆要顯示的通知 payload。 */
export class LiveNotificationService {
  constructor(
    private readonly options: {
      now?: () => Date;
      random?: () => number;
      realOrderSource?: RealOrderSource;
      genId?: () => string;
    } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private random(): number {
    return this.options.random ? this.options.random() : Math.random();
  }

  private genId(): string {
    return this.options.genId ? this.options.genId() : `ln_${Math.random().toString(36).slice(2, 10)}`;
  }

  private timeAgo(date: Date): string {
    const diffMs = this.now().getTime() - date.getTime();
    const min = Math.max(1, Math.floor(diffMs / 60_000));
    if (min < 60) return `${min} 分鐘前`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour} 小時前`;
    return `${Math.floor(hour / 24)} 天前`;
  }

  /** 取得下一筆通知。回 undefined 代表沒有可顯示資料（自動跳過）。 */
  async next(config: LiveNotificationConfig): Promise<NotificationPayload | undefined> {
    if (!config.enabled) return undefined;
    if (config.mode === 'simulated') return this.fromSimulated(config);
    return this.fromReal(config);
  }

  private fromSimulated(config: LiveNotificationConfig): NotificationPayload | undefined {
    const pool = config.simulatedPool;
    if (!pool || pool.length === 0) return undefined;
    const idx = Math.floor(this.random() * pool.length);
    const pick = pool[idx]!;
    // simulated mode：時間 1~30 分鐘前
    const min = Math.max(1, Math.floor(this.random() * 30) + 1);
    return {
      id: this.genId(),
      displayName: pick.displayName,
      productTitle: pick.productTitle,
      locationHint: pick.locationHint,
      timeAgoLabel: `${min} 分鐘前`,
      position: config.position,
      compliance: 'sample',
    };
  }

  private async fromReal(config: LiveNotificationConfig): Promise<NotificationPayload | undefined> {
    if (!this.options.realOrderSource) {
      throw new Error('real 模式需注入 realOrderSource');
    }
    const lookback = config.realLookbackMinutes ?? 60;
    const orders = await this.options.realOrderSource({
      tenantId: config.tenantId,
      productIds: config.realProductIds,
      sinceMinutes: lookback,
    });
    if (orders.length === 0) return undefined;
    const idx = Math.floor(this.random() * orders.length);
    const order = orders[idx]!;
    return {
      id: this.genId(),
      displayName: order.displayName,
      productTitle: order.productTitle,
      locationHint: order.locationHint,
      timeAgoLabel: this.timeAgo(order.createdAt),
      position: config.position,
      compliance: 'verified',
    };
  }

  /** 計算下一則應該等多久（秒）。 */
  nextDelaySeconds(config: LiveNotificationConfig, isFirst: boolean): number {
    if (isFirst) return config.firstDelaySeconds;
    const { minSeconds, maxSeconds } = config.intervalRange;
    if (maxSeconds < minSeconds) throw new Error('intervalRange.max 必須 >= min');
    return Math.floor(this.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
  }

  /** 後台預覽：把名單轉成樣本 payload 陣列。 */
  preview(config: LiveNotificationConfig, count: number): NotificationPayload[] {
    const out: NotificationPayload[] = [];
    if (config.mode === 'simulated' && config.simulatedPool) {
      for (let i = 0; i < Math.min(count, config.simulatedPool.length); i += 1) {
        const p = config.simulatedPool[i]!;
        out.push({
          id: `preview_${i}`,
          displayName: p.displayName,
          productTitle: p.productTitle,
          locationHint: p.locationHint,
          timeAgoLabel: `${i + 1} 分鐘前`,
          position: config.position,
          compliance: 'sample',
        });
      }
    }
    return out;
  }
}
