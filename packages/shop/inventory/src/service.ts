import { randomBytes } from 'node:crypto';

import { DEFAULT_RESERVE_TTL_SECONDS, InventoryVersionConflictError } from './types.js';

import type {
  InventoryItem,
  InventoryReservation,
  InventoryStore,
  ReserveRequest,
  ReserveResult,
} from './types.js';

/**
 * 產生 reservation id。
 */
function generateReservationId(): string {
  return `rsv_${Date.now().toString(36)}_${randomBytes(6).toString('hex')}`;
}

/**
 * 預扣 CAS 衝突重試上限。實務上 3 次足以涵蓋常見並發；
 * 仍然衝突視為熱門商品被瞬間搶光，直接回 insufficient。
 */
const MAX_RESERVE_RETRIES = 3;

export interface InventoryServiceConfig {
  store: InventoryStore;
  /** 取得時間（測試可注入）。 */
  now?: () => number;
  /** 安全庫存警示鉤子。 */
  onLowStock?: (item: InventoryItem) => void;
  /** 預扣建立後鉤子（事件總線可在此 emit）。 */
  onReserved?: (reservation: InventoryReservation) => void;
}

/**
 * 庫存服務：預扣 / 消化 / 釋放 / 補貨警示。
 */
export class InventoryService {
  constructor(private readonly config: InventoryServiceConfig) {}

  private now(): number {
    return this.config.now?.() ?? Date.now();
  }

  /**
   * 預扣庫存。對每個 item 從 priority 最高的倉庫開始扣，扣完再下一個。
   * 任一 item 不足即整批失敗（不部分扣）。
   *
   * 使用樂觀鎖（CAS）防止 TOCTOU 超賣：
   * 讀取 → 規劃 → 寫入時帶 expectedVersion，
   * 若版本衝突表示有其他交易同時扣同一筆庫存，重試最多 {@link MAX_RESERVE_RETRIES} 次。
   */
  async reserve(req: ReserveRequest): Promise<ReserveResult> {
    const ttl = (req.ttlSeconds ?? DEFAULT_RESERVE_TTL_SECONDS) * 1000;

    for (let attempt = 0; attempt < MAX_RESERVE_RETRIES; attempt++) {
      const result = await this.tryReserve(req, ttl);
      if (result.kind === 'ok') return result.value;
      if (result.kind === 'insufficient') return result.value;
      // kind === 'conflict' → 重新讀取最新庫存再嘗試
    }
    // 達重試上限：視為熱門商品被瞬間搶光，回 insufficient（不部分扣）。
    return {
      success: false,
      reservations: [],
      insufficient: req.items.map((line) => ({
        variantId: line.variantId,
        requested: line.quantity,
        available: 0,
      })),
    };
  }

  /**
   * 單次預扣嘗試。回傳 ok / insufficient / conflict。
   */
  private async tryReserve(
    req: ReserveRequest,
    ttl: number,
  ): Promise<
    | { kind: 'ok'; value: ReserveResult }
    | { kind: 'insufficient'; value: ReserveResult }
    | { kind: 'conflict' }
  > {
    const now = this.now();
    const insufficient: ReserveResult['insufficient'] = [];
    const plan: Array<{ item: InventoryItem; take: number }> = [];

    for (const line of req.items) {
      const items = await this.config.store.listItemsByVariant(line.variantId);
      let remaining = line.quantity;
      const available = items.reduce((sum, i) => sum + (i.onHand - i.reserved), 0);
      if (available < line.quantity) {
        insufficient.push({
          variantId: line.variantId,
          requested: line.quantity,
          available,
        });
        continue;
      }
      for (const item of items) {
        if (remaining <= 0) break;
        const free = item.onHand - item.reserved;
        if (free <= 0) continue;
        const take = Math.min(free, remaining);
        plan.push({ item, take });
        remaining -= take;
      }
    }

    if (insufficient.length > 0) {
      return { kind: 'insufficient', value: { success: false, reservations: [], insufficient } };
    }

    const reservations: InventoryReservation[] = [];
    for (const p of plan) {
      const rsv: InventoryReservation = {
        id: generateReservationId(),
        tenantId: req.tenantId,
        variantId: p.item.variantId,
        warehouseId: p.item.warehouseId,
        quantity: p.take,
        orderId: req.orderId,
        createdAt: now,
        expiresAt: now + ttl,
        status: 'held',
      };
      try {
        await this.config.store.updateItem(
          p.item.id,
          { reserved: p.item.reserved + p.take },
          p.item.version,
        );
      } catch (err) {
        if (err instanceof InventoryVersionConflictError) {
          // rollback：本輪已寫入的 reservation + item.reserved 釋放，回頭重試。
          await this.rollbackPartial(reservations);
          return { kind: 'conflict' };
        }
        throw err;
      }
      await this.config.store.createReservation(rsv);
      reservations.push(rsv);
      this.config.onReserved?.(rsv);
    }

    return { kind: 'ok', value: { success: true, reservations } };
  }

  /**
   * CAS 衝突時釋放本輪已成功預扣的部分。
   *
   * 釋放本身也走 CAS，若再衝突就再讀再試（最多 3 次），
   * 確保不會殘留虛假 reserved（否則之後永遠無法 reserve 滿）。
   */
  private async rollbackPartial(reservations: InventoryReservation[]): Promise<void> {
    for (const rsv of reservations) {
      for (let i = 0; i < 3; i++) {
        const item = await this.config.store.getItem(rsv.variantId, rsv.warehouseId);
        if (!item) break;
        try {
          await this.config.store.updateItem(
            item.id,
            { reserved: Math.max(0, item.reserved - rsv.quantity) },
            item.version,
          );
          break;
        } catch (err) {
          if (!(err instanceof InventoryVersionConflictError)) throw err;
        }
      }
    }
  }

  /**
   * 付款完成，將預扣轉為實扣（onHand 與 reserved 同步降）。
   *
   * 使用 CAS 重試（最多 3 次），避免與 reserve / release / 其他 consume 並發衝突。
   */
  async consume(reservation: InventoryReservation): Promise<void> {
    if (reservation.status !== 'held') return;
    for (let i = 0; i < 3; i++) {
      const item = await this.config.store.getItem(
        reservation.variantId,
        reservation.warehouseId,
      );
      if (!item) return;
      const after = Math.max(0, item.onHand - reservation.quantity);
      try {
        await this.config.store.updateItem(
          item.id,
          {
            onHand: after,
            reserved: Math.max(0, item.reserved - reservation.quantity),
          },
          item.version,
        );
        await this.config.store.updateReservation(reservation.id, { status: 'consumed' });
        if (after <= item.safetyStock) {
          this.config.onLowStock?.({ ...item, onHand: after });
        }
        return;
      } catch (err) {
        if (!(err instanceof InventoryVersionConflictError)) throw err;
      }
    }
    throw new Error('consume 持續發生庫存版本衝突，請稍後重試');
  }

  /**
   * 釋放預扣（手動取消或逾時）。同樣以 CAS 重試。
   */
  async release(reservation: InventoryReservation): Promise<void> {
    if (reservation.status !== 'held') return;
    for (let i = 0; i < 3; i++) {
      const item = await this.config.store.getItem(
        reservation.variantId,
        reservation.warehouseId,
      );
      if (!item) return;
      try {
        await this.config.store.updateItem(
          item.id,
          { reserved: Math.max(0, item.reserved - reservation.quantity) },
          item.version,
        );
        await this.config.store.updateReservation(reservation.id, { status: 'released' });
        return;
      } catch (err) {
        if (!(err instanceof InventoryVersionConflictError)) throw err;
      }
    }
    throw new Error('release 持續發生庫存版本衝突，請稍後重試');
  }

  /**
   * 掃描並釋放所有過期預扣。建議用 cron 每分鐘跑。
   */
  async sweepExpired(): Promise<number> {
    const expired = await this.config.store.listExpiredReservations(this.now());
    for (const rsv of expired) {
      await this.release(rsv);
    }
    return expired.length;
  }
}
