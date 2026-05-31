import { ImageBudgetExceededError } from './errors.js';

/**
 * 每張圖估算成本（USD / image）費率表。
 *
 * 為何用「每張」而非「每 token」：生圖 provider 多以張數（或固定解析度）計價，
 * 與 copywriter 的 token 計價不同，故不直接複用 copywriter 的 BudgetTracker
 *（那是 token-based），改用此精簡的 per-image 模型。
 *
 * 數值為「保守上限估」（取各 provider 公布的中高品質檔），實際帳單以 provider 為準；
 * 守門只需「不超支」即可，估高一點不會少擋。provider 調價時更新此表。
 */
export const IMAGE_PRICING_USD: Readonly<Record<string, number>> = Object.freeze({
  // OpenAI gpt-image-2（2026-04-21）：中高品質 1024~2048 約 $0.04~0.17，取保守值
  'gpt-image-2': 0.17,
  'gpt-image-2-2026-04-21': 0.17,
  'gpt-image-1': 0.17,
  // Gemini 3.1 Flash Image Preview（Nano Banana 2，2026-02-26）：約 $0.04~0.14，取保守值
  'gemini-3.1-flash-image-preview': 0.14,
  'gemini-2.5-flash-image-preview': 0.04,
  // mock：零成本
  mock: 0,
});

/** 未知 model 的保守每張成本上限（取表中最貴值），避免低估漏擋。 */
export const FALLBACK_IMAGE_PRICE_USD = 0.2;

/**
 * 取 model 對應的每張成本（USD），未知 model fallback 到保守上限。
 */
export function getImagePriceUsd(model: string): number {
  return IMAGE_PRICING_USD[model] ?? FALLBACK_IMAGE_PRICE_USD;
}

/** 預算守門設定。 */
export interface ImageBudgetOptions {
  /** 每站累計上限（USD）。預設見 DEFAULT_IMAGE_BUDGET_USD。 */
  maxUsd: number;
}

/** 每站預設生圖預算上限（USD）。對應 goal-12 決策 3A：每站 $2。 */
export const DEFAULT_IMAGE_BUDGET_USD = 2;

/**
 * 生圖預算追蹤器。
 *
 * 工作流：
 * 1. 呼叫 provider 前 `assertWithinBudget(estimateUsd)` —— 超過直接 throw
 * 2. 拿到實際結果後 `recordActual(usd)` —— 累計實際成本
 *
 * 與 copywriter BudgetTracker 同介面（assertWithinBudget / recordActual / getUsedUsd），
 * 但成本來源是 per-image 而非 per-token。
 */
export class ImageBudgetTracker {
  private readonly maxUsd: number;
  private usedUsd: number;

  public constructor(options: ImageBudgetOptions) {
    this.maxUsd = options.maxUsd;
    this.usedUsd = 0;
  }

  /** 呼叫前檢查：若「已用 + 本次預估」會超過上限就 throw。 */
  public assertWithinBudget(estimateUsd: number): void {
    if (this.usedUsd + estimateUsd > this.maxUsd) {
      throw new ImageBudgetExceededError(estimateUsd, this.usedUsd, this.maxUsd);
    }
  }

  /** 累計實際成本（負值忽略）。 */
  public recordActual(actualUsd: number): void {
    if (actualUsd > 0) {
      this.usedUsd += actualUsd;
    }
  }

  /** 目前累計實際成本（USD）。 */
  public getUsedUsd(): number {
    return this.usedUsd;
  }

  /** 預算上限（USD）。 */
  public getMaxUsd(): number {
    return this.maxUsd;
  }

  /** 剩餘預算（USD）。 */
  public getRemainingUsd(): number {
    return Math.max(0, this.maxUsd - this.usedUsd);
  }

  /** 重置累計（保留 maxUsd 設定）。 */
  public reset(): void {
    this.usedUsd = 0;
  }
}
