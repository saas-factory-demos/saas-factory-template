/**
 * 庫存模組型別（goal 03 §2）。
 *
 * Lock：ADR-0011 §03-02 v1。
 */

/**
 * 預扣記錄。下單時建立，付款後消化或逾時釋放。
 */
export interface InventoryReservation {
  id: string;
  tenantId: string;
  variantId: string;
  warehouseId: string;
  quantity: number;
  /** 訂單 id（付款後查表消化用）。 */
  orderId: string;
  /** 建立時間，UNIX ms。 */
  createdAt: number;
  /** 過期時間，逾時自動釋放。預設下單後 900 秒（15 分）。 */
  expiresAt: number;
  status: 'held' | 'consumed' | 'released';
}

/**
 * 倉庫資料。
 */
export interface Warehouse {
  id: string;
  tenantId: string;
  name: string;
  /** 出貨優先序，越小越優先。 */
  priority: number;
  /** 是否啟用。 */
  active: boolean;
  /** 倉庫實體地址（國際物流用）。 */
  address?: string;
}

/**
 * 庫存項目（SKU × 倉庫）。
 */
export interface InventoryItem {
  id: string;
  tenantId: string;
  variantId: string;
  warehouseId: string;
  /** 實際在庫。 */
  onHand: number;
  /** 預扣中。 */
  reserved: number;
  /** 安全庫存（低於此數警示）。 */
  safetyStock: number;
  /** 批號（保健食品 / 化妝品有效期限管理）。 */
  batchNumber?: string;
  /** 效期。 */
  expiresAt?: string;
  /**
   * 樂觀鎖版本號。每次成功 `updateItem` 必須 +1，
   * 用於 reserve 流程的 compare-and-swap，避免 TOCTOU 超賣。
   */
  version: number;
}

/**
 * 補貨通知訂閱。
 */
export interface RestockSubscription {
  id: string;
  tenantId: string;
  variantId: string;
  /** 訂閱者 email。 */
  email: string;
  createdAt: string;
  /** 已通知時間，null 表示未通知。 */
  notifiedAt: string | null;
}

/**
 * 預扣請求。
 */
export interface ReserveRequest {
  tenantId: string;
  orderId: string;
  /** 預扣項目，可多 SKU。 */
  items: Array<{ variantId: string; quantity: number }>;
  /** 預扣秒數，預設 900。 */
  ttlSeconds?: number;
}

/**
 * 預扣結果。
 */
export interface ReserveResult {
  success: boolean;
  reservations: InventoryReservation[];
  /** 若失敗，列出庫存不足的 variantId。 */
  insufficient?: Array<{ variantId: string; requested: number; available: number }>;
}

/**
 * 樂觀鎖版本衝突錯誤。
 *
 * 預扣流程讀取庫存後，若其他交易先寫入導致 version 改變，
 * 應由 caller 重新讀取最新庫存再嘗試（service 內建有限次數重試）。
 */
export class InventoryVersionConflictError extends Error {
  override readonly name = 'InventoryVersionConflictError' as const;
  constructor(
    readonly itemId: string,
    readonly expected: number,
    readonly actual: number,
  ) {
    super(`InventoryItem ${itemId} version 衝突（expected=${expected}, actual=${actual}）`);
  }
}

/**
 * 庫存儲存抽象（記憶體 / DB 實作）。
 *
 * 生產環境的 DB 實作必須將 `updateItem` 落為條件 UPDATE，例如：
 * `UPDATE inventory_items SET ... , version = version + 1
 *  WHERE id = $1 AND version = $expected`，
 * 影響筆數為 0 時拋出 `InventoryVersionConflictError`，避免超賣。
 */
export interface InventoryStore {
  getItem(variantId: string, warehouseId: string): Promise<InventoryItem | null>;
  /** 取得 variant 全倉庫庫存，依 warehouse priority 排序。 */
  listItemsByVariant(variantId: string): Promise<InventoryItem[]>;
  createReservation(reservation: InventoryReservation): Promise<void>;
  updateReservation(id: string, patch: Partial<InventoryReservation>): Promise<void>;
  listExpiredReservations(now: number): Promise<InventoryReservation[]>;
  /**
   * 更新庫存項目。
   *
   * 若提供 `expectedVersion`，必須以 compare-and-swap 寫入：
   * 當資料庫中 version !== expectedVersion 時拋 `InventoryVersionConflictError`。
   * 寫入成功時 version 自動 +1。未提供 expectedVersion 時為無鎖更新（僅限管理員後台直接調整）。
   */
  updateItem(
    id: string,
    patch: Partial<InventoryItem>,
    expectedVersion?: number,
  ): Promise<void>;
}

/**
 * 預設預扣秒數：15 分鐘（台灣電商常規）。
 */
export const DEFAULT_RESERVE_TTL_SECONDS = 900;
