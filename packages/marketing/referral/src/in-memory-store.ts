import type { ReferralCode, ReferralRedemption, RewardGrant } from './types.js';

/** 推薦碼 store。 */
export interface ReferralCodeStore {
  insert(c: ReferralCode): Promise<void>;
  update(c: ReferralCode): Promise<void>;
  findByCode(tenantId: string, code: string): Promise<ReferralCode | undefined>;
  findByReferrer(tenantId: string, referrerCustomerId: string): Promise<ReferralCode | undefined>;
}

/** Redemption store。 */
export interface RedemptionStore {
  insert(r: ReferralRedemption): Promise<void>;
  findByReferee(tenantId: string, refereeCustomerId: string): Promise<ReferralRedemption[]>;
  listByReferrer(tenantId: string, referrerCustomerId: string): Promise<ReferralRedemption[]>;
  /** 防作弊用：查 device id 或 ip 最近 N 小時的 redemption。 */
  findRecentByFingerprint(
    tenantId: string,
    fingerprint: { ip?: string; deviceId?: string },
    sinceMs: Date,
  ): Promise<ReferralRedemption[]>;
}

/** Reward grant store。 */
export interface RewardGrantStore {
  insert(g: RewardGrant): Promise<void>;
  listByCustomer(tenantId: string, customerId: string): Promise<RewardGrant[]>;
}

/** In-memory 實作。 */
export class InMemoryReferralCodeStore implements ReferralCodeStore {
  private byCode = new Map<string, ReferralCode>();
  private key(t: string, c: string): string {
    return `${t}|${c}`;
  }
  async insert(c: ReferralCode): Promise<void> {
    const k = this.key(c.tenantId, c.code);
    if (this.byCode.has(k)) throw new Error(`code 已存在：${c.code}`);
    this.byCode.set(k, c);
  }
  async update(c: ReferralCode): Promise<void> {
    const k = this.key(c.tenantId, c.code);
    if (!this.byCode.has(k)) throw new Error(`code 不存在：${c.code}`);
    this.byCode.set(k, c);
  }
  async findByCode(tenantId: string, code: string): Promise<ReferralCode | undefined> {
    return this.byCode.get(this.key(tenantId, code));
  }
  async findByReferrer(
    tenantId: string,
    referrerCustomerId: string,
  ): Promise<ReferralCode | undefined> {
    return Array.from(this.byCode.values()).find(
      (c) => c.tenantId === tenantId && c.referrerCustomerId === referrerCustomerId,
    );
  }
}

export class InMemoryRedemptionStore implements RedemptionStore {
  private list: ReferralRedemption[] = [];
  async insert(r: ReferralRedemption): Promise<void> {
    this.list.push(r);
  }
  async findByReferee(
    tenantId: string,
    refereeCustomerId: string,
  ): Promise<ReferralRedemption[]> {
    return this.list.filter(
      (r) => r.tenantId === tenantId && r.refereeCustomerId === refereeCustomerId,
    );
  }
  async listByReferrer(
    tenantId: string,
    referrerCustomerId: string,
  ): Promise<ReferralRedemption[]> {
    return this.list.filter(
      (r) => r.tenantId === tenantId && r.referrerCustomerId === referrerCustomerId,
    );
  }
  async findRecentByFingerprint(
    tenantId: string,
    fingerprint: { ip?: string; deviceId?: string },
    since: Date,
  ): Promise<ReferralRedemption[]> {
    return this.list.filter(
      (r) =>
        r.tenantId === tenantId &&
        r.at >= since &&
        ((fingerprint.ip && r.refereeIp === fingerprint.ip) ||
          (fingerprint.deviceId && r.refereeDeviceId === fingerprint.deviceId)),
    );
  }
}

export class InMemoryRewardGrantStore implements RewardGrantStore {
  private list: RewardGrant[] = [];
  async insert(g: RewardGrant): Promise<void> {
    this.list.push(g);
  }
  async listByCustomer(tenantId: string, customerId: string): Promise<RewardGrant[]> {
    return this.list.filter((g) => g.tenantId === tenantId && g.customerId === customerId);
  }
}
