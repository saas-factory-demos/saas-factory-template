/**
 * Token bucket 實作的呼叫速率限制器。
 *
 * 演算法：
 * - bucket 以 `capacity` 為上限，每經過 `intervalMs / capacity` 毫秒補 1 個 token
 * - 每次 `acquire()` 會嘗試扣 1 個 token，扣不到就排隊等待（不丟錯）
 *
 * 為何要排隊而不直接 throw：依任務需求「超過排隊等待，不直接 throw」。
 * 呼叫端在大量並發場景仍會得到順序穩定的回應，避免大量 429 重試風暴。
 */

/**
 * 速率限制器設定。
 *
 * 預設值：10 個 token / 60 秒（對應任務「default 10 req/min」）。
 */
export interface RateLimiterOptions {
  /** 桶子最大容量（同時可消化的 burst 量）。 */
  capacity?: number;
  /** 補滿一輪 capacity 所需的毫秒數。 */
  intervalMs?: number;
  /** 注入時間取得器（測試用）。 */
  now?: () => number;
  /** 注入排程器（測試用，預設 setTimeout）。 */
  schedule?: (callback: () => void, delayMs: number) => void;
}

/** 預設容量：10 個 token。 */
const DEFAULT_CAPACITY = 10;
/** 預設補滿週期：60 秒。 */
const DEFAULT_INTERVAL_MS = 60_000;

/**
 * Token bucket rate limiter。
 *
 * 線程模型：JS 單執行緒前提下，內部 queue 不需要 lock。
 */
export class TokenBucketRateLimiter {
  private readonly capacity: number;
  private readonly intervalMs: number;
  private readonly nowFn: () => number;
  private readonly scheduleFn: (callback: () => void, delayMs: number) => void;
  /** 當前 token 數（浮點以支援連續補充）。 */
  private tokens: number;
  /** 上次補 token 的時間戳。 */
  private lastRefillAt: number;
  /** 等待中的呼叫者 resolve queue。 */
  private readonly waiters: Array<() => void> = [];

  public constructor(options: RateLimiterOptions = {}) {
    this.capacity = options.capacity ?? DEFAULT_CAPACITY;
    this.intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
    this.nowFn = options.now ?? (() => Date.now());
    this.scheduleFn = options.schedule ?? ((cb, delay) => void setTimeout(cb, delay));
    this.tokens = this.capacity;
    this.lastRefillAt = this.nowFn();
  }

  /**
   * 取得一個 token。若桶子已空則回傳一個會等到有 token 時 resolve 的 Promise。
   *
   * 永遠不會 reject。
   */
  public acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.waiters.push(resolve);
      this.scheduleNextRefill();
    });
  }

  /**
   * 取得目前可用的剩餘 token 數（整數，向下取整）。
   *
   * 用於 `client.getRemainingQuota()` 監控。
   */
  public getRemaining(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  /** 依時間流逝補 token，不會超過 capacity。 */
  private refill(): void {
    const now = this.nowFn();
    const elapsed = now - this.lastRefillAt;
    if (elapsed <= 0) {
      return;
    }
    const refillRate = this.capacity / this.intervalMs;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * refillRate);
    this.lastRefillAt = now;
    this.drainWaiters();
  }

  /** 喚醒等待中的呼叫者。 */
  private drainWaiters(): void {
    while (this.waiters.length > 0 && this.tokens >= 1) {
      const next = this.waiters.shift();
      if (next) {
        this.tokens -= 1;
        next();
      }
    }
  }

  /** 預約下一次補充。 */
  private scheduleNextRefill(): void {
    if (this.waiters.length === 0) {
      return;
    }
    const msPerToken = this.intervalMs / this.capacity;
    const delay = Math.max(1, Math.ceil(msPerToken - (this.nowFn() - this.lastRefillAt)));
    this.scheduleFn(() => {
      this.refill();
      // 若還有人在排隊但 token 還不夠，繼續排程
      if (this.waiters.length > 0) {
        this.scheduleNextRefill();
      }
    }, delay);
  }
}
