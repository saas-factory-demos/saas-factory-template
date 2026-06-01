import { randomBytes } from 'node:crypto';

import {
  addMonths,
  computeEarnPoints,
  computeRolling12mSpendMinor,
  resolveTier,
} from './helpers.js';
import { executeRedeem } from './redeem.js';

import type {
  CustomerTierStore,
  PointEntryStore,
  ProgramConfigStore,
  RedemptionStore,
  RewardItemStore,
} from './in-memory-store.js';
import type {
  CustomerTier,
  LoyaltyProgramConfig,
  LoyaltyTier,
  PointBalance,
  PointEntry,
  Redemption,
  RewardItem,
} from './types.js';

/** Loyalty 服務。 */
export class LoyaltyService {
  constructor(
    private readonly entries: PointEntryStore,
    private readonly tiers: CustomerTierStore,
    private readonly rewards: RewardItemStore,
    private readonly redemptions: RedemptionStore,
    private readonly configs: ProgramConfigStore,
    private readonly handlers: {
      /** 兌換時實際發行 coupon / gift card 的橋接。 */
      issueReward: (input: {
        tenantId: string;
        customerId: string;
        reward: RewardItem;
      }) => Promise<{ ok: true; issuedCode: string } | { ok: false; error: string }>;
    },
    private readonly options: { now?: () => Date; genId?: () => string } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(prefix: string): string {
    if (this.options.genId) return this.options.genId();
    return `${prefix}_${randomBytes(5).toString('hex')}`;
  }

  private async getConfig(tenantId: string): Promise<LoyaltyProgramConfig> {
    const c = await this.configs.findByTenant(tenantId);
    if (!c) throw new Error(`找不到 loyalty 設定：${tenantId}`);
    return c;
  }

  private async getCurrentTier(
    tenantId: string,
    customerId: string,
    cfg: LoyaltyProgramConfig,
  ): Promise<LoyaltyTier> {
    const t = await this.tiers.findByCustomer(tenantId, customerId);
    const code = t?.currentTier;
    const found = cfg.tiers.find((x) => x.code === code);
    return found ?? resolveTier(0, cfg.tiers);
  }

  /** 儲存 / 更新 program 設定。 */
  async upsertProgram(config: LoyaltyProgramConfig): Promise<void> {
    if (config.tiers.length === 0) throw new Error('至少需要一個 tier');
    await this.configs.upsert(config);
  }

  /** 訂單發點。 */
  async earnFromOrder(input: {
    tenantId: string;
    customerId: string;
    orderId: string;
    orderTotalMinor: number;
    at?: Date;
  }): Promise<PointEntry> {
    const cfg = await this.getConfig(input.tenantId);
    const tier = await this.getCurrentTier(input.tenantId, input.customerId, cfg);
    const points = computeEarnPoints(input.orderTotalMinor, tier, cfg);
    const at = input.at ?? this.now();
    const expiresAt = cfg.pointLifetimeMonths
      ? addMonths(at, cfg.pointLifetimeMonths)
      : undefined;
    const entry: PointEntry = {
      id: this.genId('pe'),
      tenantId: input.tenantId,
      customerId: input.customerId,
      kind: 'earn-order',
      points,
      sourceId: input.orderId,
      expiresAt,
      consumed: 0,
      expired: false,
      createdAt: at,
    };
    await this.entries.insert(entry);
    await this.recomputeTier(input.tenantId, input.customerId);
    return entry;
  }

  /** 後台手動補點 / 註冊禮 / 生日禮 / 評論。 */
  async issuePoints(input: {
    tenantId: string;
    customerId: string;
    kind: 'earn-review' | 'earn-signup' | 'earn-birthday' | 'earn-manual';
    points: number;
    sourceId?: string;
    note?: string;
  }): Promise<PointEntry> {
    if (input.points <= 0) throw new Error('points 必須 > 0');
    const cfg = await this.getConfig(input.tenantId);
    const at = this.now();
    const expiresAt = cfg.pointLifetimeMonths
      ? addMonths(at, cfg.pointLifetimeMonths)
      : undefined;
    const entry: PointEntry = {
      id: this.genId('pe'),
      tenantId: input.tenantId,
      customerId: input.customerId,
      kind: input.kind,
      points: input.points,
      sourceId: input.sourceId,
      expiresAt,
      consumed: 0,
      expired: false,
      note: input.note,
      createdAt: at,
    };
    await this.entries.insert(entry);
    return entry;
  }

  /** 訂單退款 → 反扣點數（從 FIFO 先消耗 earn-order）。 */
  async clawbackForRefund(input: {
    tenantId: string;
    customerId: string;
    orderId: string;
    orderTotalMinor: number;
  }): Promise<PointEntry> {
    const cfg = await this.getConfig(input.tenantId);
    const tier = await this.getCurrentTier(input.tenantId, input.customerId, cfg);
    const points = computeEarnPoints(input.orderTotalMinor, tier, cfg);
    const entry: PointEntry = {
      id: this.genId('pe'),
      tenantId: input.tenantId,
      customerId: input.customerId,
      kind: 'refund-clawback',
      points: -points,
      sourceId: input.orderId,
      consumed: 0,
      expired: false,
      createdAt: this.now(),
    };
    await this.entries.insert(entry);
    await this.recomputeTier(input.tenantId, input.customerId);
    return entry;
  }

  /** 取得餘額快照。 */
  async getBalance(tenantId: string, customerId: string): Promise<PointBalance> {
    const list = await this.entries.listByCustomer(tenantId, customerId);
    let earned = 0;
    let redeemed = 0;
    let expired = 0;
    for (const e of list) {
      if (e.points > 0) earned += e.points;
      else redeemed += -e.points;
      if (e.expired) expired += e.points - e.consumed;
    }
    // 退款 clawback 也計在 redeemed（負值已加總）
    const available = earned - redeemed - expired;
    return { customerId, totalEarned: earned, totalRedeemed: redeemed, totalExpired: expired, available };
  }

  /** 兌換 reward（FIFO 消耗 earn）。 */
  async redeem(input: {
    tenantId: string;
    customerId: string;
    rewardId: string;
  }): Promise<Redemption> {
    return executeRedeem(
      {
        entries: this.entries,
        rewards: this.rewards,
        redemptions: this.redemptions,
        issueReward: this.handlers.issueReward,
        now: () => this.now(),
        genId: (prefix) => this.genId(prefix),
        getBalance: (t, c) => this.getBalance(t, c),
      },
      input,
    );
  }

  /** Cron：沖銷已過期未消耗的 earn 紀錄。 */
  async sweepExpired(tenantId: string, now: Date = this.now()): Promise<PointEntry[]> {
    const list = await this.entries.listExpiredPending(tenantId, now);
    const out: PointEntry[] = [];
    for (const e of list) {
      const leftover = e.points - e.consumed;
      const expiredEntry: PointEntry = { ...e, expired: true, consumed: e.points };
      await this.entries.update(expiredEntry);
      const ledger: PointEntry = {
        id: this.genId('pe'),
        tenantId: e.tenantId,
        customerId: e.customerId,
        kind: 'expire',
        points: -leftover,
        sourceId: e.id,
        consumed: 0,
        expired: false,
        createdAt: now,
      };
      await this.entries.insert(ledger);
      out.push(ledger);
    }
    return out;
  }

  /** 重新計算顧客 tier（依過去 12 個月 earn-order 訂單總額對應）。 */
  async recomputeTier(tenantId: string, customerId: string): Promise<CustomerTier> {
    const cfg = await this.getConfig(tenantId);
    const now = this.now();
    const list = await this.entries.listByCustomer(tenantId, customerId);
    const spendMinor = computeRolling12mSpendMinor(list, cfg, addMonths(now, -12));
    const tier = resolveTier(spendMinor, cfg.tiers);
    const next: CustomerTier = {
      tenantId,
      customerId,
      currentTier: tier.code,
      rolling12mSpendMinor: spendMinor,
      updatedAt: now,
    };
    await this.tiers.upsert(next);
    return next;
  }

  /** 建立 reward item。 */
  async createReward(input: Omit<RewardItem, 'id'>): Promise<RewardItem> {
    const r: RewardItem = { ...input, id: this.genId('rw') };
    await this.rewards.insert(r);
    return r;
  }

  /** 列出可兌換的 reward。 */
  async listActiveRewards(tenantId: string): Promise<RewardItem[]> {
    return this.rewards.listActive(tenantId);
  }
}
