import type {
  ExitLeadStore,
  ExitStatsStore,
  VisitorExitStateStore,
} from './in-memory-store.js';
import type {
  ExitDecision,
  ExitIntentConfig,
  ExitTrigger,
  LeadCapturePayload,
} from './types.js';

/** 折扣碼核發 hook（外層接 coupon 套件）。 */
export type CouponIssueHook = (input: {
  tenantId: string;
  templateId: string;
  email?: string;
  phone?: string;
}) => Promise<{ code: string; expiresAt: Date }>;

/** 偵測請求（前端 throw 上來的事件 + 環境資料）。 */
export interface ExitDetectionInput {
  visitorId: string;
  trigger: ExitTrigger;
  /** 已停留秒數（前端計算）。 */
  dwellSeconds: number;
  /** 用戶是否已轉換（下過單）；外層帶入。 */
  hasConverted: boolean;
}

/** Exit-intent 服務。負責 trigger 判斷 + lead 捕獲。 */
export class ExitIntentService {
  constructor(
    private readonly state: VisitorExitStateStore,
    private readonly leads: ExitLeadStore,
    private readonly stats: ExitStatsStore,
    private readonly options: {
      now?: () => Date;
      random?: () => number;
      couponIssue?: CouponIssueHook;
    } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private random(): number {
    return this.options.random ? this.options.random() : Math.random();
  }

  /** 由 weight 按比例選一個 variant。 */
  private pickVariant(config: ExitIntentConfig): string {
    const total = config.variants.reduce((s, v) => s + v.weight, 0);
    if (total <= 0) throw new Error('variant weight 總和必須 > 0');
    let r = this.random() * total;
    for (const v of config.variants) {
      r -= v.weight;
      if (r <= 0) return v.id;
    }
    return config.variants[config.variants.length - 1]!.id;
  }

  /** 判斷是否該顯示彈窗。考量設定、訪客狀態、冷卻、最大次數、已轉換、已捕獲。 */
  async decide(config: ExitIntentConfig, input: ExitDetectionInput): Promise<ExitDecision> {
    if (!config.enabled) return { show: false, reason: 'disabled' };
    if (!config.triggers.includes(input.trigger)) {
      return { show: false, reason: 'trigger-not-allowed' };
    }
    if (input.hasConverted) return { show: false, reason: 'already-converted' };
    if (input.dwellSeconds < config.minDwellSeconds) {
      return { show: false, reason: 'dwell-too-short' };
    }
    const state = await this.state.get(input.visitorId, config.pageId);
    if (state?.hasCaptured) return { show: false, reason: 'lead-captured' };
    if (state && state.shownCount >= config.maxShowPerSession) {
      return { show: false, reason: 'max-shown' };
    }
    if (state?.lastShownAt) {
      const elapsed = (this.now().getTime() - state.lastShownAt.getTime()) / 1000;
      if (elapsed < config.cooldownSeconds) {
        return { show: false, reason: 'cooldown' };
      }
    }
    const variantId = this.pickVariant(config);
    await this.state.put({
      visitorId: input.visitorId,
      tenantId: config.tenantId,
      pageId: config.pageId,
      hasCaptured: false,
      shownCount: (state?.shownCount ?? 0) + 1,
      lastShownAt: this.now(),
      lastVariantId: variantId,
    });
    await this.stats.recordTrigger(config.tenantId, config.pageId, variantId);
    return { show: true, variantId };
  }

  /** 使用者送出 email / 手機 → 核發折扣 + 永久 suppress。 */
  async captureLead(
    config: ExitIntentConfig,
    visitorId: string,
    payload: LeadCapturePayload,
  ): Promise<{ code: string; expiresAt: Date }> {
    if (!payload.email && !payload.phone) {
      throw new Error('必須提供 email 或 phone 至少一項');
    }
    const state = await this.state.get(visitorId, config.pageId);
    if (!state || !state.lastVariantId) {
      throw new Error('找不到觸發紀錄，無法核發');
    }
    const variant = config.variants.find((v) => v.id === state.lastVariantId);
    if (!variant) throw new Error(`variant 不存在：${state.lastVariantId}`);
    if (!this.options.couponIssue) {
      throw new Error('未注入 CouponIssueHook');
    }
    const coupon = await this.options.couponIssue({
      tenantId: config.tenantId,
      templateId: variant.couponTemplateId,
      email: payload.email,
      phone: payload.phone,
    });
    await this.leads.save({
      tenantId: config.tenantId,
      pageId: config.pageId,
      visitorId,
      variantId: variant.id,
      email: payload.email,
      phone: payload.phone,
      capturedAt: this.now(),
    });
    await this.state.put({ ...state, hasCaptured: true });
    await this.stats.recordCapture(config.tenantId, config.pageId, variant.id);
    return coupon;
  }

  /** 後台統計：每個 variant 的轉換率。 */
  async statsOf(tenantId: string, pageId: string) {
    return this.stats.stats(tenantId, pageId);
  }
}
