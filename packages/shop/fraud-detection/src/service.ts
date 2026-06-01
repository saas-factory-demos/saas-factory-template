import type {
  BlacklistEntry,
  CustomerRiskMark,
  FraudAction,
  FraudCheckInput,
  FraudCheckResult,
  FraudRulesConfig,
  FraudStore,
  OrderRecord,
  TriggeredSignal,
} from './types.js';

/**
 * 預設規則設定。客戶可在 Payload 後台覆寫部分欄位。
 */
const DEFAULTS: Required<FraudRulesConfig> = {
  ipVelocity: { windowMinutes: 10, maxOrdersPerIp: 3, score: 40 },
  addressDiversity: { windowDays: 30, maxDistinctAddresses: 3, score: 25 },
  highAmount: { threshold: 50_000, score: 30 },
  highRejectionRate: { rateThreshold: 0.3, minOrders: 3, score: 35 },
  blacklistScore: 100,
  blockThreshold: 70,
  reviewThreshold: 30,
};

/**
 * 詐刷偵測服務：對訂單做多規則風險評分並回傳建議動作。
 */
export class FraudDetectionService {
  private readonly store: FraudStore;
  private readonly rules: Required<FraudRulesConfig>;

  constructor(store: FraudStore, rules: FraudRulesConfig = {}) {
    this.store = store;
    this.rules = {
      ipVelocity: rules.ipVelocity ?? DEFAULTS.ipVelocity,
      addressDiversity: rules.addressDiversity ?? DEFAULTS.addressDiversity,
      highAmount: rules.highAmount ?? DEFAULTS.highAmount,
      highRejectionRate: rules.highRejectionRate ?? DEFAULTS.highRejectionRate,
      blacklistScore: rules.blacklistScore ?? DEFAULTS.blacklistScore,
      blockThreshold: rules.blockThreshold ?? DEFAULTS.blockThreshold,
      reviewThreshold: rules.reviewThreshold ?? DEFAULTS.reviewThreshold,
    };
  }

  /**
   * 對給定的訂單訊號跑全部規則，回傳分數 / 建議動作 / 觸發訊號清單。
   */
  async check(input: FraudCheckInput): Promise<FraudCheckResult> {
    const now = input.now ?? new Date();
    const signals: TriggeredSignal[] = [];

    // 1. 黑名單檢查（命中即累加 blacklistScore，依 entry.action 可能直接 block）
    const blacklist = await this.store.listActiveBlacklist(input.tenantId, now);
    const blacklistHits = this.matchBlacklist(input, blacklist);
    let forceBlock = false;
    for (const hit of blacklistHits) {
      signals.push({
        kind: this.blacklistKindToSignal(hit.kind),
        message: `命中黑名單：${hit.kind}=${hit.value}（${hit.reason ?? '無理由'}）`,
        score: this.rules.blacklistScore,
      });
      if ((hit.action ?? 'block') === 'block') forceBlock = true;
    }

    // 2. IP velocity
    if (input.ip) {
      const since = new Date(now.getTime() - this.rules.ipVelocity.windowMinutes * 60_000);
      const recent = await this.store.listOrdersByIp(input.tenantId, input.ip, since);
      if (recent.length >= this.rules.ipVelocity.maxOrdersPerIp) {
        signals.push({
          kind: 'ip-velocity',
          message: `同 IP（${input.ip}）${this.rules.ipVelocity.windowMinutes} 分鐘內已有 ${recent.length} 筆訂單`,
          score: this.rules.ipVelocity.score,
        });
      }
    }

    // 3. 收件地址多樣性
    if ((input.userId || input.email) && input.shippingAddress) {
      const since = new Date(
        now.getTime() - this.rules.addressDiversity.windowDays * 86_400_000,
      );
      const customerOrders = await this.store.listOrdersByCustomer(
        input.tenantId,
        { userId: input.userId, email: input.email },
        since,
      );
      const distinct = new Set(
        customerOrders.map((o) => o.shippingAddress).filter((a): a is string => !!a),
      );
      distinct.add(input.shippingAddress);
      if (distinct.size > this.rules.addressDiversity.maxDistinctAddresses) {
        signals.push({
          kind: 'address-diversity',
          message: `近 ${this.rules.addressDiversity.windowDays} 天內出現 ${distinct.size} 個不同收件地址`,
          score: this.rules.addressDiversity.score,
        });
      }
    }

    // 4. 高金額
    if (input.amount >= this.rules.highAmount.threshold) {
      signals.push({
        kind: 'high-amount',
        message: `訂單金額 ${input.amount} 達高金額門檻 ${this.rules.highAmount.threshold}`,
        score: this.rules.highAmount.score,
      });
    }

    // 5. 拒收率過高
    if (input.userId || input.email) {
      const mark = await this.store.getCustomerRisk(input.tenantId, {
        userId: input.userId,
        email: input.email,
      });
      if (
        mark &&
        mark.totalOrderCount >= this.rules.highRejectionRate.minOrders &&
        mark.rejectionRate >= this.rules.highRejectionRate.rateThreshold
      ) {
        signals.push({
          kind: 'high-rejection-rate',
          message: `該客戶歷史拒收率 ${(mark.rejectionRate * 100).toFixed(1)}%（${mark.totalOrderCount} 單）`,
          score: this.rules.highRejectionRate.score,
        });
      }
    }

    const riskScore = signals.reduce((sum, s) => sum + s.score, 0);
    let action: FraudAction;
    if (forceBlock || riskScore >= this.rules.blockThreshold) action = 'block';
    else if (riskScore >= this.rules.reviewThreshold) action = 'review';
    else action = 'allow';

    return { riskScore: Math.min(riskScore, 100), action, signals };
  }

  /**
   * 新增黑名單條目。
   */
  async addBlacklist(
    entry: Omit<BlacklistEntry, 'id' | 'createdAt'> & { id?: string; createdAt?: Date },
  ): Promise<BlacklistEntry> {
    const full: BlacklistEntry = {
      id: entry.id ?? `bl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      tenantId: entry.tenantId,
      kind: entry.kind,
      value: entry.value,
      reason: entry.reason,
      expiresAt: entry.expiresAt,
      action: entry.action,
      createdAt: entry.createdAt ?? new Date(),
    };
    return this.store.upsertBlacklist(full);
  }

  /**
   * 移除黑名單條目。
   */
  async removeBlacklist(id: string): Promise<void> {
    await this.store.deleteBlacklist(id);
  }

  /**
   * 訂單成立後紀錄一筆事件供後續分析。
   */
  async recordOrder(order: OrderRecord): Promise<void> {
    await this.store.recordOrder(order);
    if (order.userId || order.email) {
      await this.refreshCustomerRisk(order.tenantId, {
        userId: order.userId,
        email: order.email,
      });
    }
  }

  /**
   * 收件人拒收後呼叫，重新計算客戶風險標記。
   */
  async markOrderRejected(
    tenantId: string,
    orderId: string,
    customer: { userId?: string; email?: string },
  ): Promise<void> {
    await this.store.markRejected(orderId);
    await this.refreshCustomerRisk(tenantId, customer);
  }

  /**
   * 由訂單歷史重新計算指定客戶的拒收率，寫入 CustomerRiskMark。
   */
  private async refreshCustomerRisk(
    tenantId: string,
    customer: { userId?: string; email?: string },
  ): Promise<void> {
    if (!customer.userId && !customer.email) return;
    const since = new Date(0);
    const all = await this.store.listOrdersByCustomer(tenantId, customer, since);
    const total = all.length;
    const rejected = all.filter((o) => o.rejected).length;
    const rate = total === 0 ? 0 : rejected / total;
    const existing = await this.store.getCustomerRisk(tenantId, customer);
    const mark: CustomerRiskMark = {
      id: existing?.id ?? `rm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      tenantId,
      userId: customer.userId,
      email: customer.email,
      rejectionCount: rejected,
      totalOrderCount: total,
      rejectionRate: rate,
      manualHighRisk: existing?.manualHighRisk,
      updatedAt: new Date(),
    };
    await this.store.upsertCustomerRisk(mark);
  }

  /**
   * 從輸入訊號比對所有有效黑名單條目，回傳命中清單。
   */
  private matchBlacklist(
    input: FraudCheckInput,
    blacklist: BlacklistEntry[],
  ): BlacklistEntry[] {
    return blacklist.filter((entry) => {
      switch (entry.kind) {
        case 'email':
          return !!input.email && entry.value === input.email;
        case 'phone':
          return !!input.phone && entry.value === input.phone;
        case 'card-hash':
          return !!input.cardHash && entry.value === input.cardHash;
        case 'ip':
          return !!input.ip && entry.value === input.ip;
        default:
          return false;
      }
    });
  }

  private blacklistKindToSignal(kind: BlacklistEntry['kind']): TriggeredSignal['kind'] {
    switch (kind) {
      case 'email':
        return 'blacklist-email';
      case 'phone':
        return 'blacklist-phone';
      case 'card-hash':
        return 'blacklist-card-hash';
      case 'ip':
        return 'blacklist-ip';
    }
  }
}
