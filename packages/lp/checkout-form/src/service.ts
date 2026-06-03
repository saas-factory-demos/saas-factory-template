import { LpFormPayloadSchema } from './schema.js';

import type { OrderDraftStore, OtpStore } from './in-memory-store.js';
import type { LpFormPayload, LpPlan, OrderBump, OrderDraft, PaymentMethod } from './types.js';

/** 折扣計算結果。 */
export interface DiscountResult {
  /** 折抵金額（minor unit）。 */
  amountMinor: number;
  /** 折抵描述（顯示在訂單上）。 */
  description: string;
}

/** 折扣解析器（由外層注入，避免綁死優惠引擎）。 */
export type DiscountResolver = (
  code: string,
  context: { tenantId: string; pageId: string; subtotalMinor: number },
) => Promise<DiscountResult | undefined>;

/** OTP 發送 hook（外層接 SMS 服務）。 */
export type OtpSenderHook = (phone: string, code: string) => Promise<void>;

/** OTP 發送速率上限預設值。 */
export const OTP_RATE_LIMIT_DEFAULTS = {
  /** 短窗：10 分鐘最多發 3 次（防連按）。 */
  shortWindowMinutes: 10,
  shortWindowMax: 3,
  /** 長窗：1 小時最多發 6 次（防整體濫用 + 簡訊費）。 */
  longWindowMinutes: 60,
  longWindowMax: 6,
} as const;

/** LP 結帳設定（每個 LP 可獨立）。 */
export interface CheckoutFormConfig {
  tenantId: string;
  pageId: string;
  plans: LpPlan[];
  defaultPlanId?: string;
  paymentMethods: PaymentMethod[];
  /** 是否啟用 OTP 驗證（防詐單）。 */
  otpEnabled: boolean;
  /** Order Bump（送出表單前的勾選項目）。 */
  orderBump?: OrderBump;
}

/** LP 表單結帳服務。負責驗證、OTP、建單、回傳訂單草稿。 */
export class LpCheckoutFormService {
  constructor(
    private readonly orders: OrderDraftStore,
    private readonly otps: OtpStore,
    private readonly options: {
      now?: () => Date;
      genId?: () => string;
      genOtp?: () => string;
      otpTtlMinutes?: number;
      otpSender?: OtpSenderHook;
      discountResolver?: DiscountResolver;
      /** OTP 速率上限（覆蓋預設值）。 */
      otpRateLimit?: {
        shortWindowMinutes?: number;
        shortWindowMax?: number;
        longWindowMinutes?: number;
        longWindowMax?: number;
      };
    } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(): string {
    return this.options.genId ? this.options.genId() : `od_${Math.random().toString(36).slice(2, 10)}`;
  }

  private genOtp(): string {
    if (this.options.genOtp) return this.options.genOtp();
    return Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(6, '0');
  }

  /**
   * 發送 OTP 驗證碼到指定手機。
   *
   * 速率上限：避免簡訊轟炸 + 控制簡訊成本。預設短窗 10 分鐘 3 次、長窗
   * 1 小時 6 次；超過則 throw（前端應顯示「稍候再試」並停止重送按鈕）。
   */
  async issueOtp(tenantId: string, phone: string): Promise<{ code: string; expiresAt: Date }> {
    await this.checkOtpRateLimit(tenantId, phone);
    const code = this.genOtp();
    const ttl = (this.options.otpTtlMinutes ?? 5) * 60_000;
    const issuedAt = this.now();
    const expiresAt = new Date(issuedAt.getTime() + ttl);
    await this.otps.put({ tenantId, phone, code, expiresAt });
    await this.otps.recordSend(tenantId, phone, issuedAt);
    if (this.options.otpSender) await this.options.otpSender(phone, code);
    return { code, expiresAt };
  }

  /** 套用 OTP 速率上限；超過任一窗 → throw。 */
  private async checkOtpRateLimit(tenantId: string, phone: string): Promise<void> {
    const limits = {
      shortWindowMinutes:
        this.options.otpRateLimit?.shortWindowMinutes ?? OTP_RATE_LIMIT_DEFAULTS.shortWindowMinutes,
      shortWindowMax:
        this.options.otpRateLimit?.shortWindowMax ?? OTP_RATE_LIMIT_DEFAULTS.shortWindowMax,
      longWindowMinutes:
        this.options.otpRateLimit?.longWindowMinutes ?? OTP_RATE_LIMIT_DEFAULTS.longWindowMinutes,
      longWindowMax:
        this.options.otpRateLimit?.longWindowMax ?? OTP_RATE_LIMIT_DEFAULTS.longWindowMax,
    };
    const now = this.now().getTime();
    const shortSince = new Date(now - limits.shortWindowMinutes * 60_000);
    const longSince = new Date(now - limits.longWindowMinutes * 60_000);
    const [shortCount, longCount] = await Promise.all([
      this.otps.countRecentSends(tenantId, phone, shortSince),
      this.otps.countRecentSends(tenantId, phone, longSince),
    ]);
    if (shortCount >= limits.shortWindowMax) {
      throw new Error(`OTP 發送過於頻繁，請於 ${limits.shortWindowMinutes} 分鐘後再試`);
    }
    if (longCount >= limits.longWindowMax) {
      throw new Error(`OTP 今日發送次數已達上限，請稍後再試`);
    }
  }

  /** 驗證 OTP 是否正確且未過期。 */
  async verifyOtp(tenantId: string, phone: string, code: string): Promise<boolean> {
    const rec = await this.otps.find(tenantId, phone);
    if (!rec) return false;
    if (rec.consumedAt) return false;
    if (rec.expiresAt.getTime() < this.now().getTime()) return false;
    return rec.code === code;
  }

  /** 提交表單，建單並回傳訂單草稿。失敗時 throw（前端顯示錯誤）。 */
  async submit(config: CheckoutFormConfig, payload: LpFormPayload): Promise<OrderDraft> {
    const parsed = LpFormPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error(`表單驗證失敗：${parsed.error.issues.map((i) => i.message).join('、')}`);
    }
    if (parsed.data.tenantId !== config.tenantId || parsed.data.pageId !== config.pageId) {
      throw new Error('表單來源不符');
    }
    if (!config.paymentMethods.includes(parsed.data.paymentMethod)) {
      throw new Error(`此 LP 不支援付款方式：${parsed.data.paymentMethod}`);
    }
    const plan = config.plans.find((p) => p.id === parsed.data.planId);
    if (!plan) throw new Error(`找不到方案：${parsed.data.planId}`);

    if (parsed.data.paymentMethod === 'cod' && !parsed.data.shipping) {
      throw new Error('貨到付款必須填寫收件地址');
    }
    if (config.otpEnabled) {
      if (!parsed.data.otpCode) throw new Error('需要 OTP 驗證碼');
      const ok = await this.verifyOtp(config.tenantId, parsed.data.customer.phone, parsed.data.otpCode);
      if (!ok) throw new Error('OTP 驗證失敗或已過期');
      await this.otps.consume(config.tenantId, parsed.data.customer.phone, this.now());
    }

    const items: OrderDraft['items'] = [
      { productId: `plan_${plan.id}`, title: plan.title, priceMinor: plan.priceMinor },
    ];
    if (parsed.data.orderBumpAccepted && config.orderBump) {
      items.push({
        productId: config.orderBump.productId,
        title: config.orderBump.title,
        priceMinor: config.orderBump.priceMinor,
      });
    }
    const subtotalMinor = items.reduce((s, i) => s + i.priceMinor, 0);
    let totalMinor = subtotalMinor;
    if (parsed.data.couponCode && this.options.discountResolver) {
      const d = await this.options.discountResolver(parsed.data.couponCode, {
        tenantId: config.tenantId,
        pageId: config.pageId,
        subtotalMinor,
      });
      if (d) totalMinor = Math.max(0, subtotalMinor - d.amountMinor);
    }

    const draft: OrderDraft = {
      id: this.genId(),
      tenantId: config.tenantId,
      pageId: config.pageId,
      customer: parsed.data.customer,
      shipping: parsed.data.shipping,
      invoice: parsed.data.invoice,
      items,
      totalMinor,
      paymentMethod: parsed.data.paymentMethod,
      status: 'pending',
      createdAt: this.now(),
      // 信用卡走 Stripe / TapPay → 卡片 token 由金流端保存，這裡標記可供 Upsell 一鍵加購
      hasStoredPayment: parsed.data.paymentMethod === 'credit-card',
    };
    await this.orders.insert(draft);
    return draft;
  }

  /** 取得訂單草稿（給後續 funnel / 確認頁查用）。 */
  async getDraft(id: string): Promise<OrderDraft | undefined> {
    return this.orders.findById(id);
  }

  /** 更新訂單狀態（金流回呼）。 */
  async markStatus(id: string, status: OrderDraft['status']): Promise<void> {
    await this.orders.updateStatus(id, status);
  }
}
