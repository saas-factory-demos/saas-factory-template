/** 客戶生命週期階段（與 retargeting 同義，避免循環依賴自定）。 */
export type LifecycleStage =
  | 'new'
  | 'active'
  | 'at-risk'
  | 'dormant'
  | 'lost'
  | 'never-purchased';

/** 客戶 profile（segment 評估的輸入快照）。 */
export interface CustomerProfile {
  tenantId: string;
  customerId: string;
  /** 自由標籤（例：'vip'、'meta-ad'）。 */
  tags: string[];
  /** 累計消費。 */
  totalSpentMinor: number;
  totalOrders: number;
  /** 最後一次下單時間。 */
  lastOrderAt?: Date;
  /** 最後瀏覽商品時間。 */
  lastViewedAt?: Date;
  /** 最後加購時間。 */
  lastAddedToCartAt?: Date;
  lifecycleStage: LifecycleStage;
  /** 自訂屬性（給後台彈性條件用）。 */
  customAttrs?: Record<string, string | number | boolean>;
  /** 行銷同意：用來在 push 群發時過濾。 */
  consents?: {
    email?: boolean;
    line?: boolean;
    sms?: boolean;
  };
}

/** Leaf 條件運算子。 */
export type LeafOp =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'not-in'
  | 'has-tag'
  | 'within-days'
  | 'older-than-days';

/** Predicate DSL。 */
export type Predicate =
  | { op: LeafOp; field: string; value?: unknown }
  | { op: 'all'; of: Predicate[] }
  | { op: 'any'; of: Predicate[] }
  | { op: 'not'; of: Predicate };

/** Segment 定義。 */
export interface Segment {
  id: string;
  tenantId: string;
  name: string;
  predicate: Predicate;
  /** 動態 segment 不存名單，每次評估；static 會快照名單（本實作只做 dynamic）。 */
  dynamic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** 群發推送通道。 */
export type PushChannel = 'email' | 'line' | 'sms';

/** 評估後輸出。 */
export interface SegmentMembership {
  segmentId: string;
  members: CustomerProfile[];
}
