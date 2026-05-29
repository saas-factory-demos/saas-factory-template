/**
 * AI Copywriter 套件統一錯誤類別。
 *
 * 設計目的：讓呼叫端可以用 `instanceof` 精準分流不同錯誤情境
 *（429 vs 5xx vs 4xx vs 預算守門），不必再用字串比對訊息。
 */

/**
 * Anthropic API 回傳非 2xx 時統一拋出此錯誤。
 *
 * 內含 HTTP status 與 raw body，方便 Sentry / log 還原現場。
 */
export class AnthropicAPIError extends Error {
  /** HTTP 狀態碼。 */
  public readonly status: number;
  /** Anthropic 回傳的原始 body（可能為 JSON 字串或純文字）。 */
  public readonly body: string;

  public constructor(status: number, body: string, message?: string) {
    super(message ?? `Anthropic API 失敗（${status}）：${body}`);
    this.name = 'AnthropicAPIError';
    this.status = status;
    this.body = body;
  }
}

/**
 * 速率限制（HTTP 429）專屬錯誤。
 *
 * 重試達上限後才會拋出，重試流程內部不會洩漏這個錯誤。
 * 若 Anthropic 回傳 `retry-after` 標頭，會解析後寫進 `retryAfterMs`。
 */
export class RateLimitedError extends AnthropicAPIError {
  /** Anthropic 建議的等待毫秒數（從 `retry-after` 標頭解析）。 */
  public readonly retryAfterMs: number | null;

  public constructor(status: number, body: string, retryAfterMs: number | null) {
    super(status, body, `Anthropic 速率限制（${status}）：${body}`);
    this.name = 'RateLimitedError';
    this.retryAfterMs = retryAfterMs;
  }
}

/**
 * 預算守門失敗時拋出。
 *
 * 兩種觸發情境：
 * 1. 呼叫前估算「累計成本 + 本次預估」已超過 `maxUsd` → 直接拒絕呼叫
 * 2. 呼叫前發現 `maxUsd` 已被先前實際用量耗盡
 *
 * `attemptedUsd` / `usedUsd` / `maxUsd` 都以美元為單位（浮點）。
 */
export class BudgetExceededError extends Error {
  /** 本次呼叫的預估成本（USD）。 */
  public readonly attemptedUsd: number;
  /** 目前已累計實際成本（USD）。 */
  public readonly usedUsd: number;
  /** 預算上限（USD）。 */
  public readonly maxUsd: number;

  public constructor(attemptedUsd: number, usedUsd: number, maxUsd: number) {
    super(
      `預算守門：本次預估 $${attemptedUsd.toFixed(4)} + 已用 $${usedUsd.toFixed(4)} ` +
        `> 上限 $${maxUsd.toFixed(4)}（USD）`,
    );
    this.name = 'BudgetExceededError';
    this.attemptedUsd = attemptedUsd;
    this.usedUsd = usedUsd;
    this.maxUsd = maxUsd;
  }
}
