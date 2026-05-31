import type { CodBlacklistStore, CodOrderStore } from './in-memory-store.js';
import type {
  CodBlacklistEntry,
  CodChannel,
  CodOrder,
  RejectionStats,
} from './types.js';

/** 黑名單觸發門檻設定。 */
export interface BlacklistPolicy {
  /** 一個客戶累積幾次拒收後進黑名單。 */
  maxRejectionsBeforeBlacklist: number;
  /** 同一 phone 在 velocity 時窗內最多可建立幾張 COD 訂單。預設 3。 */
  velocityMaxOrders?: number;
  /** velocity 時窗（分鐘）。預設 60 分鐘。 */
  velocityWindowMinutes?: number;
}

/** COD 服務。 */
export class LpCodService {
  constructor(
    private readonly orders: CodOrderStore,
    private readonly blacklist: CodBlacklistStore,
    private readonly policy: BlacklistPolicy = { maxRejectionsBeforeBlacklist: 2 },
    private readonly options: {
      now?: () => Date;
      genId?: () => string;
    } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(): string {
    return this.options.genId ? this.options.genId() : `cod_${Math.random().toString(36).slice(2, 10)}`;
  }

  /** 建立 COD 訂單（會檢查黑名單與 velocity 上限）。 */
  async createOrder(input: {
    tenantId: string;
    pageId: string;
    draftId: string;
    customer: CodOrder['customer'];
    channel: CodChannel;
    totalMinor: number;
  }): Promise<CodOrder> {
    const banned = await this.blacklist.get(input.tenantId, input.customer.phone);
    if (banned && banned.rejectionCount >= this.policy.maxRejectionsBeforeBlacklist) {
      throw new Error(`客戶在黑名單，無法建立 COD：${input.customer.phone}`);
    }
    // velocity 防呆：同 phone 短時間連環下單常見於詐單腳本（人工跟催成本高）。
    const velocityMax = this.policy.velocityMaxOrders ?? 3;
    const velocityWindowMin = this.policy.velocityWindowMinutes ?? 60;
    const since = new Date(this.now().getTime() - velocityWindowMin * 60_000);
    const recent = await this.orders.countByPhoneSince(input.tenantId, input.customer.phone, since);
    if (recent >= velocityMax) {
      throw new Error(
        `同手機在 ${velocityWindowMin} 分鐘內已建立 ${recent} 張 COD 訂單，請聯絡客服`,
      );
    }
    const order: CodOrder = {
      id: this.genId(),
      tenantId: input.tenantId,
      pageId: input.pageId,
      draftId: input.draftId,
      customer: input.customer,
      channel: input.channel,
      totalMinor: input.totalMinor,
      status: 'pending-confirm',
      followUp: 'queued',
      attempts: 0,
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    await this.orders.insert(order);
    return order;
  }

  /** 客服跟催：標記一次嘗試。 */
  async attemptFollowUp(orderId: string): Promise<CodOrder> {
    const o = await this.require(orderId);
    if (o.status !== 'pending-confirm') {
      throw new Error('只有 pending-confirm 訂單可跟催');
    }
    const updated: CodOrder = {
      ...o,
      followUp: 'attempted',
      attempts: o.attempts + 1,
      lastAttemptAt: this.now(),
      updatedAt: this.now(),
    };
    await this.orders.update(updated);
    return updated;
  }

  /** 多次無人接：標 unreachable，超過 3 次自動取消。 */
  async markUnreachable(orderId: string): Promise<CodOrder> {
    const o = await this.require(orderId);
    if (o.attempts >= 3) {
      return this.cancel(orderId, '客服多次無人接');
    }
    const updated: CodOrder = {
      ...o,
      followUp: 'unreachable',
      updatedAt: this.now(),
    };
    await this.orders.update(updated);
    return updated;
  }

  /** 客服確認 → confirmed，可出貨。 */
  async confirm(orderId: string): Promise<CodOrder> {
    const o = await this.require(orderId);
    if (o.status !== 'pending-confirm') {
      throw new Error('只能從 pending-confirm 切到 confirmed');
    }
    const updated: CodOrder = {
      ...o,
      status: 'confirmed',
      followUp: 'confirmed',
      updatedAt: this.now(),
    };
    await this.orders.update(updated);
    return updated;
  }

  /** 出貨。 */
  async markShipped(orderId: string): Promise<CodOrder> {
    const o = await this.require(orderId);
    if (o.status !== 'confirmed') {
      throw new Error('只能從 confirmed 切到 shipped');
    }
    const updated: CodOrder = { ...o, status: 'shipped', updatedAt: this.now() };
    await this.orders.update(updated);
    return updated;
  }

  /** 客戶取貨 / 收款。 */
  async markDelivered(orderId: string): Promise<CodOrder> {
    const o = await this.require(orderId);
    if (o.status !== 'shipped') {
      throw new Error('只能從 shipped 切到 delivered');
    }
    const updated: CodOrder = { ...o, status: 'delivered', updatedAt: this.now() };
    await this.orders.update(updated);
    return updated;
  }

  /** 拒收：累計到黑名單。 */
  async markRejected(orderId: string, reason?: string): Promise<CodOrder> {
    const o = await this.require(orderId);
    if (o.status !== 'shipped') {
      throw new Error('只能從 shipped 切到 rejected');
    }
    const updated: CodOrder = {
      ...o,
      status: 'rejected',
      rejectReason: reason,
      updatedAt: this.now(),
    };
    await this.orders.update(updated);
    await this.bumpBlacklist(o.tenantId, o.customer.phone, {
      orderId: o.id,
      reason,
      at: this.now(),
    });
    return updated;
  }

  /** 客服取消（pending-confirm 階段，例：多次無人接）。 */
  async cancel(orderId: string, reason: string): Promise<CodOrder> {
    const o = await this.require(orderId);
    if (o.status === 'delivered' || o.status === 'rejected') {
      throw new Error('已結案訂單不可取消');
    }
    const updated: CodOrder = {
      ...o,
      status: 'cancelled',
      followUp: 'cancelled',
      rejectReason: reason,
      updatedAt: this.now(),
    };
    await this.orders.update(updated);
    return updated;
  }

  /** 拒收率：delivered + rejected 為分母。 */
  async rejectionStats(tenantId: string): Promise<RejectionStats> {
    const all = await this.orders.listByTenant(tenantId);
    const delivered = all.filter((o) => o.status === 'delivered').length;
    const rejected = all.filter((o) => o.status === 'rejected').length;
    const total = delivered + rejected;
    return {
      totalDeliveryAttempted: total,
      rejectedCount: rejected,
      rejectionRate: total === 0 ? 0 : rejected / total,
    };
  }

  /** 查黑名單。 */
  async checkBlacklist(tenantId: string, phone: string): Promise<CodBlacklistEntry | undefined> {
    return this.blacklist.get(tenantId, phone);
  }

  private async bumpBlacklist(
    tenantId: string,
    phone: string,
    record: { orderId: string; reason?: string; at: Date },
  ): Promise<void> {
    const existing = await this.blacklist.get(tenantId, phone);
    const rejectionCount = (existing?.rejectionCount ?? 0) + 1;
    const history = [...(existing?.history ?? []), record];
    // 每次拒收都累計（含第 1 次），但只有達門檻才會阻擋未來下單（見 createOrder）
    await this.blacklist.upsert({
      tenantId,
      phone,
      rejectionCount,
      blacklistedAt: existing?.blacklistedAt ?? this.now(),
      history,
    });
  }

  private async require(id: string): Promise<CodOrder> {
    const o = await this.orders.findById(id);
    if (!o) throw new Error(`找不到 COD 訂單：${id}`);
    return o;
  }
}
