/** 黑名單條目類型。 */
export type BlacklistKind = 'email' | 'phone' | 'card-hash' | 'ip';

/** 推薦處置動作。 */
export type FraudAction = 'allow' | 'review' | 'block';

/** 風險訊號類型代號（觸發的規則）。 */
export type FraudSignalKind =
  | 'ip-velocity'
  | 'address-diversity'
  | 'high-amount'
  | 'blacklist-email'
  | 'blacklist-phone'
  | 'blacklist-card-hash'
  | 'blacklist-ip'
  | 'high-rejection-rate';

/**
 * 黑名單條目。任一條目命中即標記訂單需審核 / 直接 block。
 */
export interface BlacklistEntry {
  id: string;
  tenantId: string;
  kind: BlacklistKind;
  /** 對應的值：email 字串 / 電話號碼 / 卡號 SHA-256 hash / IP 字串 */
  value: string;
  /** 加入理由（供後台檢視） */
  reason?: string;
  /** 自動到期時間，到期後失效；undefined 表永久 */
  expiresAt?: Date;
  /** 命中時建議動作（預設 block） */
  action?: FraudAction;
  createdAt: Date;
}

/**
 * 客戶歷史風險標記（拒收率高、退款率高等）。
 */
export interface CustomerRiskMark {
  id: string;
  tenantId: string;
  userId?: string;
  email?: string;
  /** 拒收次數 */
  rejectionCount: number;
  /** 總訂單數 */
  totalOrderCount: number;
  /** 拒收率（0~1） */
  rejectionRate: number;
  /** 手動標記為高風險 */
  manualHighRisk?: boolean;
  updatedAt: Date;
}

/**
 * 訂單記錄（簡化版，僅供 IP 頻次 / 地址多樣性 / 拒收率分析）。
 */
export interface OrderRecord {
  id: string;
  tenantId: string;
  userId?: string;
  email?: string;
  phone?: string;
  ip?: string;
  cardHash?: string;
  shippingAddress?: string;
  amount: number;
  /** 是否被收件人拒收 */
  rejected?: boolean;
  createdAt: Date;
}

/**
 * 詐刷檢查的輸入訊號。
 */
export interface FraudCheckInput {
  tenantId: string;
  userId?: string;
  email?: string;
  phone?: string;
  ip?: string;
  /** 信用卡號 SHA-256 hash（caller 端做，本套件不接觸明碼卡號） */
  cardHash?: string;
  shippingAddress?: string;
  amount: number;
  /** 當下時間（注入以便測試） */
  now?: Date;
}

/**
 * 單一觸發訊號。
 */
export interface TriggeredSignal {
  kind: FraudSignalKind;
  message: string;
  /** 該訊號貢獻的分數（累加進 riskScore） */
  score: number;
}

/**
 * 詐刷檢查結果。
 */
export interface FraudCheckResult {
  /** 0~100 風險分數 */
  riskScore: number;
  /** 建議動作 */
  action: FraudAction;
  /** 觸發的訊號清單（供後台 / log 顯示） */
  signals: TriggeredSignal[];
}

/**
 * 風險規則閾值設定。
 */
export interface FraudRulesConfig {
  /** 同 IP 在 windowMinutes 內超過 maxOrdersPerIp 筆觸發 ip-velocity */
  ipVelocity?: { windowMinutes: number; maxOrdersPerIp: number; score: number };
  /** 同帳號（email / userId）過去 windowDays 內收件地址數超過 maxDistinctAddresses 觸發 */
  addressDiversity?: { windowDays: number; maxDistinctAddresses: number; score: number };
  /** 訂單金額超過 threshold 觸發 high-amount */
  highAmount?: { threshold: number; score: number };
  /** 拒收率超過 rateThreshold 且訂單數 >= minOrders 觸發 high-rejection-rate */
  highRejectionRate?: { rateThreshold: number; minOrders: number; score: number };
  /** 命中黑名單貢獻的分數 */
  blacklistScore?: number;
  /** 分數 >= 此值建議 block，介於 reviewThreshold 與 blockThreshold 之間建議 review */
  blockThreshold?: number;
  /** 分數 >= 此值建議 review */
  reviewThreshold?: number;
}

/**
 * 儲存層介面。
 */
export interface FraudStore {
  /** 列出指定租戶當前有效（未過期）的黑名單條目 */
  listActiveBlacklist(tenantId: string, now: Date): Promise<BlacklistEntry[]>;
  upsertBlacklist(entry: BlacklistEntry): Promise<BlacklistEntry>;
  deleteBlacklist(id: string): Promise<void>;

  /** 取得客戶風險標記（email 或 userId 任一） */
  getCustomerRisk(
    tenantId: string,
    key: { userId?: string; email?: string },
  ): Promise<CustomerRiskMark | undefined>;
  upsertCustomerRisk(mark: CustomerRiskMark): Promise<CustomerRiskMark>;

  /** 列出指定 IP 在 since 之後的訂單記錄 */
  listOrdersByIp(tenantId: string, ip: string, since: Date): Promise<OrderRecord[]>;
  /** 列出指定客戶在 since 之後的訂單記錄 */
  listOrdersByCustomer(
    tenantId: string,
    key: { userId?: string; email?: string },
    since: Date,
  ): Promise<OrderRecord[]>;
  /** 新增訂單記錄（給呼叫端在訂單成立後寫入，後續分析用） */
  recordOrder(order: OrderRecord): Promise<OrderRecord>;
  /** 標記訂單拒收 */
  markRejected(orderId: string): Promise<void>;
}
