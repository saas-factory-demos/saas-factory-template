import { randomBytes, randomInt } from 'node:crypto';

import type {
  RedemptionStore,
  ReferralCodeStore,
  RewardGrantStore,
} from './in-memory-store.js';
import type {
  ReferralCode,
  ReferralPolicy,
  ReferralRedemption,
  RewardGrant,
  ShareTemplate,
} from './types.js';

const HOUR = 60 * 60 * 1000;

/** 推薦好友 give & get 服務。 */
export class ReferralService {
  constructor(
    private readonly codes: ReferralCodeStore,
    private readonly redemptions: RedemptionStore,
    private readonly grants: RewardGrantStore,
    private readonly policy: ReferralPolicy,
    private readonly options: { now?: () => Date; genCode?: () => string; genId?: () => string } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(prefix: string): string {
    if (this.options.genId) return this.options.genId();
    return `${prefix}_${randomBytes(5).toString('hex')}`;
  }

  private genCode(): string {
    if (this.options.genCode) return this.options.genCode();
    // 6 字推薦碼，從 A-Z + 0-9（36 chars）抽，用 crypto.randomInt 避免猜測
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let s = '';
    for (let i = 0; i < 6; i++) s += alphabet[randomInt(alphabet.length)];
    return s;
  }

  /** 取得或建立推薦人的推薦碼。 */
  async getOrCreateCode(tenantId: string, referrerCustomerId: string): Promise<ReferralCode> {
    const existing = await this.codes.findByReferrer(tenantId, referrerCustomerId);
    if (existing) return existing;
    const c: ReferralCode = {
      code: this.genCode(),
      tenantId,
      referrerCustomerId,
      createdAt: this.now(),
      usedCount: 0,
    };
    await this.codes.insert(c);
    return c;
  }

  /** 嘗試兌換推薦：依 policy.trigger 決定何時呼叫（signup 或 first-purchase）。 */
  async redeem(input: {
    tenantId: string;
    code: string;
    refereeCustomerId: string;
    refereeIp?: string;
    refereeDeviceId?: string;
    orderId?: string;
    at: Date;
  }): Promise<ReferralRedemption> {
    const code = await this.codes.findByCode(input.tenantId, input.code);
    if (!code) throw new Error(`找不到推薦碼：${input.code}`);

    // 自推自
    if (code.referrerCustomerId === input.refereeCustomerId) {
      return this.recordRejection(input, code, 'rejected-self');
    }

    // 被推薦人已用過任何推薦
    const prev = await this.redemptions.findByReferee(input.tenantId, input.refereeCustomerId);
    if (prev.some((p) => p.status === 'redeemed')) {
      return this.recordRejection(input, code, 'rejected-fraud');
    }

    // 同 ip / device 在 N 小時內重複領
    if (input.refereeIp || input.refereeDeviceId) {
      const since = new Date(input.at.getTime() - this.policy.duplicateWindowHours * HOUR);
      const dup = await this.redemptions.findRecentByFingerprint(
        input.tenantId,
        { ip: input.refereeIp, deviceId: input.refereeDeviceId },
        since,
      );
      if (dup.some((d) => d.status === 'redeemed')) {
        return this.recordRejection(input, code, 'rejected-fraud');
      }
    }

    // 觸達上限
    const successCount = (
      await this.redemptions.listByReferrer(input.tenantId, code.referrerCustomerId)
    ).filter((r) => r.status === 'redeemed').length;
    if (successCount >= this.policy.maxRedemptionsPerReferrer) {
      return this.recordRejection(input, code, 'rejected-cap');
    }

    const redemption: ReferralRedemption = {
      id: this.genId('rd'),
      tenantId: input.tenantId,
      code: input.code,
      referrerCustomerId: code.referrerCustomerId,
      refereeCustomerId: input.refereeCustomerId,
      orderId: input.orderId,
      refereeIp: input.refereeIp,
      refereeDeviceId: input.refereeDeviceId,
      status: 'redeemed',
      referrerRewardMinor: this.policy.referrerRewardMinor,
      refereeRewardMinor: this.policy.refereeRewardMinor,
      at: input.at,
    };
    await this.redemptions.insert(redemption);

    // 雙邊獎勵入帳
    const refGrant: RewardGrant = {
      id: this.genId('gr'),
      tenantId: input.tenantId,
      customerId: code.referrerCustomerId,
      redemptionId: redemption.id,
      side: 'referrer',
      amountMinor: this.policy.referrerRewardMinor,
      at: input.at,
    };
    const reeGrant: RewardGrant = {
      id: this.genId('gr'),
      tenantId: input.tenantId,
      customerId: input.refereeCustomerId,
      redemptionId: redemption.id,
      side: 'referee',
      amountMinor: this.policy.refereeRewardMinor,
      at: input.at,
    };
    await this.grants.insert(refGrant);
    await this.grants.insert(reeGrant);

    await this.codes.update({ ...code, usedCount: code.usedCount + 1 });
    return redemption;
  }

  private async recordRejection(
    input: {
      tenantId: string;
      code: string;
      refereeCustomerId: string;
      refereeIp?: string;
      refereeDeviceId?: string;
      orderId?: string;
      at: Date;
    },
    code: ReferralCode,
    status: 'rejected-fraud' | 'rejected-self' | 'rejected-cap',
  ): Promise<ReferralRedemption> {
    const r: ReferralRedemption = {
      id: this.genId('rd'),
      tenantId: input.tenantId,
      code: input.code,
      referrerCustomerId: code.referrerCustomerId,
      refereeCustomerId: input.refereeCustomerId,
      orderId: input.orderId,
      refereeIp: input.refereeIp,
      refereeDeviceId: input.refereeDeviceId,
      status,
      referrerRewardMinor: 0,
      refereeRewardMinor: 0,
      at: input.at,
    };
    await this.redemptions.insert(r);
    return r;
  }

  /** 給前台用：拿到分享範本（含已塞好的 code + 連結）。 */
  renderShareTemplates(code: string, baseUrl: string): ShareTemplate[] {
    const link = `${baseUrl}?ref=${encodeURIComponent(code)}`;
    return [
      {
        channel: 'line',
        text: `用我的推薦碼 ${code} 註冊，雙方都拿 NT$${this.policy.refereeRewardMinor / 100}！${link}`,
      },
      {
        channel: 'email',
        text: `推薦你一個好東西，用我的碼 ${code} 入會，我跟你都會拿 NT$${this.policy.referrerRewardMinor / 100} 折抵金。${link}`,
      },
      { channel: 'fb', text: `好東西分享 → ${link}` },
      { channel: 'copy', text: link },
    ];
  }

  /** 推薦人 dashboard：推幾人 / 拿多少。 */
  async getReferrerSummary(
    tenantId: string,
    referrerCustomerId: string,
  ): Promise<{
    code: string | null;
    successCount: number;
    totalRewardMinor: number;
    redemptions: ReferralRedemption[];
  }> {
    const code = await this.codes.findByReferrer(tenantId, referrerCustomerId);
    const list = await this.redemptions.listByReferrer(tenantId, referrerCustomerId);
    const successful = list.filter((r) => r.status === 'redeemed');
    const total = successful.reduce((s, r) => s + r.referrerRewardMinor, 0);
    return {
      code: code?.code ?? null,
      successCount: successful.length,
      totalRewardMinor: total,
      redemptions: list,
    };
  }
}
