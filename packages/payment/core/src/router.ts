import type {
  ChargeRequest,
  ChargeResult,
  PaymentMethod,
  PaymentProvider,
  PaymentProviderName,
  RefundRequest,
  RefundResult,
  SubscriptionRequest,
  SubscriptionResult,
  WebhookEvent,
} from './types.js';

/**
 * 「交易尚未建立」錯誤。
 *
 * Provider 必須在丟出此錯誤前，「能確定遠端尚未產生交易紀錄」（例如：
 * 設定錯誤、不支援之 method、本機驗證失敗、provider 回 4xx 明確拒絕）。
 *
 * 只有此類錯誤 PaymentRouter 才會 fallback 到下一個 provider；其他例外
 * （網路逾時、未知錯誤）視為「狀態不明」，直接 throw，避免雙重扣款。
 */
export class PreTradeError extends Error {
  override readonly name = 'PreTradeError' as const;
  constructor(message: string, override readonly cause?: unknown) {
    super(message);
  }
}

/**
 * 將 PaymentMethod 對應到 provider 名稱。
 * 重疊（如 credit）以 routingPreference 決定優先序。
 */
export type MethodRouting = Partial<Record<PaymentMethod, PaymentProviderName[]>>;

export interface RouterOptions {
  /** 已啟用的 provider 實例 */
  providers: PaymentProvider[];
  /** 每個 method 嘗試的 provider 優先序；若某 provider 失敗會 fallback 到下一個 */
  routing: MethodRouting;
}

/**
 * 已抵達 webhook 的 idempotency key 儲存介面。
 * goal 02 預設用 in-memory，apps 端會替換成 Payload collection。
 */
export interface IdempotencyStore {
  has(key: string): Promise<boolean>;
  remember(key: string, ttlSeconds?: number): Promise<void>;
}

/** 簡易記憶體版（用於測試 / 開發） */
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly seen = new Map<string, number>();

  async has(key: string): Promise<boolean> {
    const expireAt = this.seen.get(key);
    if (expireAt === undefined) return false;
    if (expireAt < Date.now()) {
      this.seen.delete(key);
      return false;
    }
    return true;
  }

  async remember(key: string, ttlSeconds = 60 * 60 * 24 * 7): Promise<void> {
    this.seen.set(key, Date.now() + ttlSeconds * 1000);
  }
}

/**
 * PaymentRouter：依 method 路由到 provider。
 * 失敗會自動 fallback。
 */
export class PaymentRouter {
  private readonly providerMap: Map<PaymentProviderName, PaymentProvider>;
  private readonly routing: MethodRouting;

  constructor(options: RouterOptions) {
    this.providerMap = new Map(options.providers.map((p) => [p.name, p]));
    this.routing = options.routing;
  }

  /**
   * 取出指定 method 對應的 provider 序列。
   */
  private resolveProviders(method: PaymentMethod): PaymentProvider[] {
    const names = this.routing[method] ?? [];
    const result: PaymentProvider[] = [];
    for (const name of names) {
      const p = this.providerMap.get(name);
      if (p && p.supportedMethods.includes(method)) {
        result.push(p);
      }
    }
    return result;
  }

  async charge(request: ChargeRequest): Promise<ChargeResult> {
    const candidates = this.resolveProviders(request.method);
    if (candidates.length === 0) {
      throw new Error(`no provider configured for method "${request.method}"`);
    }
    let lastError: unknown;
    for (const provider of candidates) {
      try {
        return await provider.charge(request);
      } catch (err) {
        lastError = err;
        // 僅在「明確未建立交易」時 fallback；否則視為狀態不明，立刻 throw
        // 避免在 timeout / 未知錯誤情境下對同筆訂單於兩個 provider 各刷一次。
        if (!(err instanceof PreTradeError)) {
          throw err;
        }
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error(`all providers failed for method "${request.method}"`);
  }

  async refund(
    providerName: PaymentProviderName,
    request: RefundRequest,
  ): Promise<RefundResult> {
    const provider = this.providerMap.get(providerName);
    if (!provider) {
      throw new Error(`provider "${providerName}" not registered`);
    }
    return provider.refund(request);
  }

  async createSubscription(
    request: SubscriptionRequest,
  ): Promise<SubscriptionResult> {
    const candidates = this.resolveProviders(request.method);
    if (candidates.length === 0) {
      throw new Error(
        `no provider configured for subscription method "${request.method}"`,
      );
    }
    for (const provider of candidates) {
      if (provider.createSubscription) {
        return provider.createSubscription(request);
      }
    }
    throw new Error(
      `no provider for method "${request.method}" supports subscription`,
    );
  }

  /**
   * 解析任一 provider 的 webhook（router 自行嘗試 routing 表中各 provider）。
   * 找不到對應 provider 則 throw。
   */
  async parseWebhook(
    providerName: PaymentProviderName,
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<WebhookEvent> {
    const provider = this.providerMap.get(providerName);
    if (!provider) {
      throw new Error(`provider "${providerName}" not registered`);
    }
    return provider.parseWebhook(rawBody, headers);
  }

  getProvider(name: PaymentProviderName): PaymentProvider | undefined {
    return this.providerMap.get(name);
  }
}
