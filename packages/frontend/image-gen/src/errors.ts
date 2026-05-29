/**
 * frontend-image-gen 套件統一錯誤類別。
 *
 * 設計目的：讓呼叫端用 `instanceof` 精準分流（API 失敗 vs 預算守門 vs 無圖回傳），
 * 不必字串比對訊息。對齊 frontend-copywriter 的錯誤分類風格。
 */

/**
 * 生圖 provider API 回傳非 2xx 時統一拋出。
 *
 * 內含 HTTP status + raw body，方便 Sentry / log 還原現場。
 */
export class ImageGenAPIError extends Error {
  /** HTTP 狀態碼。 */
  public readonly status: number;
  /** provider 回傳的原始 body（JSON 字串或純文字）。 */
  public readonly body: string;
  /** provider 識別碼。 */
  public readonly provider: string;

  public constructor(provider: string, status: number, body: string, message?: string) {
    super(message ?? `生圖 API 失敗（${provider} ${status}）：${body}`);
    this.name = 'ImageGenAPIError';
    this.provider = provider;
    this.status = status;
    this.body = body;
  }
}

/**
 * provider 回 2xx 但沒有任何可用圖片（如 safety 擋下、回應結構異常）時拋出。
 */
export class NoImageReturnedError extends Error {
  /** provider 識別碼。 */
  public readonly provider: string;

  public constructor(provider: string, detail?: string) {
    super(`生圖未回傳任何圖片（${provider}）${detail ? `：${detail}` : ''}`);
    this.name = 'NoImageReturnedError';
    this.provider = provider;
  }
}

/**
 * 預算守門失敗時拋出。
 *
 * 觸發：呼叫前估算「已用 + 本次預估」會超過每站上限 `maxUsd`。
 * 三個欄位皆以美元為單位（浮點）。
 */
export class ImageBudgetExceededError extends Error {
  /** 本次呼叫的預估成本（USD）。 */
  public readonly attemptedUsd: number;
  /** 目前已累計實際成本（USD）。 */
  public readonly usedUsd: number;
  /** 預算上限（USD）。 */
  public readonly maxUsd: number;

  public constructor(attemptedUsd: number, usedUsd: number, maxUsd: number) {
    super(
      `生圖預算守門：本次預估 $${attemptedUsd.toFixed(4)} + 已用 $${usedUsd.toFixed(4)} ` +
        `> 上限 $${maxUsd.toFixed(4)}（USD）`,
    );
    this.name = 'ImageBudgetExceededError';
    this.attemptedUsd = attemptedUsd;
    this.usedUsd = usedUsd;
    this.maxUsd = maxUsd;
  }
}
