/** 點數交易種類。 */
export type PointEntryKind =
  | 'earn-order' // 訂單累積
  | 'earn-review' // 評論獎勵
  | 'earn-signup' // 註冊禮
  | 'earn-birthday' // 生日禮
  | 'earn-manual' // 後台手動補
  | 'redeem' // 兌換折抵
  | 'expire' // 過期沖銷
  | 'refund-clawback' // 訂單退款扣回
  | 'adjust'; // 後台調整

/** 點數交易（ledger）。 */
export interface PointEntry {
  id: string;
  tenantId: string;
  customerId: string;
  kind: PointEntryKind;
  /** 點數（正：發放；負：扣除）。 */
  points: number;
  /** 對應訂單 / 評論 / 兌換等來源 id。 */
  sourceId?: string;
  /** 此筆點數的有效期；undefined = 永久。 */
  expiresAt?: Date;
  /** 已被消耗的點數（earn 才用，從這筆消耗的數量）。 */
  consumed: number;
  /** 是否已過期沖銷。 */
  expired: boolean;
  note?: string;
  createdAt: Date;
}

/** Tier（等級）設定。 */
export interface LoyaltyTier {
  /** 內部代碼（slug）。 */
  code: string;
  name: string;
  /** 進入此 tier 的最低累積消費（minor，年度）。 */
  thresholdMinor: number;
  /** earn 倍率（1 = 1 倍，1.5 = 1.5 倍）。 */
  earnMultiplier: number;
  /** 加碼：每 N 元 1 點。 */
  earnRateOverride?: { minorPerPoint: number };
  /** 描述（行銷文案）。 */
  benefits: string[];
}

/** 顧客 tier 狀態。 */
export interface CustomerTier {
  tenantId: string;
  customerId: string;
  currentTier: string;
  /** 用於評估升級的年度消費（minor）。 */
  rolling12mSpendMinor: number;
  updatedAt: Date;
}

/** 兌換項目（兌換目錄）。 */
export interface RewardItem {
  id: string;
  tenantId: string;
  name: string;
  /** 兌換需消耗的點數。 */
  costPoints: number;
  /** 兌換後產出的票券種類。 */
  kind: 'coupon' | 'free-shipping' | 'free-product' | 'gift-card';
  /** 對應 coupon 套件的 code 或商品 id。 */
  payloadRef: string;
  /** 庫存（undefined = 無限）。 */
  stock?: number;
  status: 'active' | 'paused' | 'archived';
}

/** 兌換紀錄。 */
export interface Redemption {
  id: string;
  tenantId: string;
  customerId: string;
  rewardId: string;
  costPoints: number;
  /** 產出物的對外代碼（例如優惠券碼）。 */
  issuedCode?: string;
  status: 'pending' | 'issued' | 'cancelled';
  createdAt: Date;
}

/** Loyalty 程式設定。 */
export interface LoyaltyProgramConfig {
  tenantId: string;
  /** 每 N 元 1 點（基準）。 */
  minorPerPoint: number;
  /** 點數有效月數；undefined = 永久。 */
  pointLifetimeMonths?: number;
  /** Tiers，依 threshold 升冪排列。 */
  tiers: LoyaltyTier[];
}

/** 顧客點數餘額快照。 */
export interface PointBalance {
  customerId: string;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  available: number;
}
