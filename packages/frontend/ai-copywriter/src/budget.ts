import { BudgetExceededError } from './errors.js';

/**
 * 模型費率（USD / 百萬 token）。
 *
 * 對齊 Anthropic 官方公開定價。未知 model 走保守 fallback。
 *
 * 注意：價格欄位是純常數，不需要 i18n / 全形標點。
 */
export interface ModelPricing {
  /** 每百萬 input token 美元成本。 */
  inputCostPerMTok: number;
  /** 每百萬 output token 美元成本。 */
  outputCostPerMTok: number;
}

/**
 * 預埋費率表。
 *
 * - `claude-opus-4-6`：對齊 ADR 0099 預設模型
 * - `claude-sonnet-4-6`：成本敏感場景備案
 * - 未列出的 model 走 `FALLBACK_PRICING`（取兩者較貴者，保守估）
 */
export const MODEL_PRICING: Readonly<Record<string, ModelPricing>> = Object.freeze({
  'claude-opus-4-6': { inputCostPerMTok: 15, outputCostPerMTok: 75 },
  'claude-sonnet-4-6': { inputCostPerMTok: 3, outputCostPerMTok: 15 },
});

/** 未知 model 的保守上限：取已知最貴 model 的價格，避免低估。 */
export const FALLBACK_PRICING: ModelPricing = Object.freeze({
  inputCostPerMTok: 15,
  outputCostPerMTok: 75,
});

/**
 * 取 model 對應費率，未知 model fallback 到保守值。
 */
export function getModelPricing(model: string): ModelPricing {
  return MODEL_PRICING[model] ?? FALLBACK_PRICING;
}

/**
 * 預算守門設定。
 *
 * 設計：
 * - `maxUsd`：累計實際成本上限，超過則拒呼叫
 * - `perSession`：true 代表預算與 client instance 同生命週期（呼叫 `resetBudget()` 才歸零）；
 *   false / 未設則行為相同（目前未實作跨 instance 共享，預留欄位給未來分散式守門）
 */
export interface BudgetOptions {
  /** 累計上限（USD）。 */
  maxUsd: number;
  /** 是否以 client session 為單位計算（預設 true）。 */
  perSession?: boolean;
}

/**
 * 預算追蹤器。
 *
 * 工作流：
 * 1. 呼叫 API 前 `assertWithinBudget(estimateUsd)` — 超過直接 throw
 * 2. 拿到實際 usage 後 `recordActual(usd)` — 累計實際成本
 */
export class BudgetTracker {
  private readonly maxUsd: number;
  private usedUsd: number;

  public constructor(options: BudgetOptions) {
    this.maxUsd = options.maxUsd;
    this.usedUsd = 0;
  }

  /**
   * 呼叫前檢查：若「已用 + 本次預估」會超過上限就 throw。
   */
  public assertWithinBudget(estimateUsd: number): void {
    if (this.usedUsd + estimateUsd > this.maxUsd) {
      throw new BudgetExceededError(estimateUsd, this.usedUsd, this.maxUsd);
    }
  }

  /** 累計實際成本。 */
  public recordActual(actualUsd: number): void {
    if (actualUsd > 0) {
      this.usedUsd += actualUsd;
    }
  }

  /** 取得目前累計實際成本（USD）。 */
  public getUsedUsd(): number {
    return this.usedUsd;
  }

  /** 取得上限（USD）。 */
  public getMaxUsd(): number {
    return this.maxUsd;
  }

  /** 重置累計（保留 maxUsd 設定）。 */
  public reset(): void {
    this.usedUsd = 0;
  }
}

/**
 * 依 input / output token 數估算成本（USD）。
 */
export function estimateCostUsd(
  pricing: ModelPricing,
  inputTokens: number,
  outputTokens: number,
): number {
  const inputCost = (Math.max(0, inputTokens) * pricing.inputCostPerMTok) / 1_000_000;
  const outputCost = (Math.max(0, outputTokens) * pricing.outputCostPerMTok) / 1_000_000;
  return inputCost + outputCost;
}

/**
 * 呼叫前的粗略預估 token 數。
 *
 * - input：用「字元數 / 4」這個業界常見的 GPT/Claude 粗估值（中文偏多時稍微低估，但 fallback pricing 已給保守 margin）
 * - output：用 `maxTokens` 上限當預估，符合「最壞情況」精神
 */
export function estimateTokens(promptChars: number, maxOutputTokens: number): {
  inputTokens: number;
  outputTokens: number;
} {
  return {
    inputTokens: Math.ceil(promptChars / 4),
    outputTokens: maxOutputTokens,
  };
}
