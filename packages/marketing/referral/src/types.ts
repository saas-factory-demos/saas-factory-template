/** 推薦碼。每位 referrer 有唯一一支。 */
export interface ReferralCode {
  code: string;
  tenantId: string;
  referrerCustomerId: string;
  createdAt: Date;
  /** 此碼被使用次數。 */
  usedCount: number;
}

/** 觸發獎勵的時機。 */
export type RedeemTrigger = 'signup' | 'first-purchase';

/** Give & Get 規則。 */
export interface ReferralPolicy {
  /** 觸發點：註冊就發 vs 首購才發。 */
  trigger: RedeemTrigger;
  /** 推薦人獎勵額度（minor，例：10000 = NT$100）。 */
  referrerRewardMinor: number;
  /** 被推薦人獎勵額度。 */
  refereeRewardMinor: number;
  /** 同 referrer 最多可成功推薦幾位（防衝量作弊）。 */
  maxRedemptionsPerReferrer: number;
  /** 同 IP 或 device 在 N 小時內不可重複領取。 */
  duplicateWindowHours: number;
}

/** 一次成功的推薦。 */
export interface ReferralRedemption {
  id: string;
  tenantId: string;
  code: string;
  referrerCustomerId: string;
  refereeCustomerId: string;
  /** 觸發來源訂單 id（trigger=first-purchase 才有）。 */
  orderId?: string;
  /** 收件人 IP（防作弊）。 */
  refereeIp?: string;
  /** 收件人 device id。 */
  refereeDeviceId?: string;
  status: 'redeemed' | 'rejected-fraud' | 'rejected-self' | 'rejected-cap';
  referrerRewardMinor: number;
  refereeRewardMinor: number;
  at: Date;
}

/** 獎勵下發紀錄（連到優惠券或點數系統）。 */
export interface RewardGrant {
  id: string;
  tenantId: string;
  customerId: string;
  redemptionId: string;
  side: 'referrer' | 'referee';
  amountMinor: number;
  at: Date;
}

/** 訊息範本（分享用）。 */
export interface ShareTemplate {
  channel: 'line' | 'email' | 'fb' | 'copy';
  text: string;
}
