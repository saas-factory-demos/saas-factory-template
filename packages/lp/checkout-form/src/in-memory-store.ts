import type { OrderDraft, OtpRecord } from './types.js';

/** 訂單草稿儲存介面。 */
export interface OrderDraftStore {
  insert(draft: OrderDraft): Promise<void>;
  findById(id: string): Promise<OrderDraft | undefined>;
  updateStatus(id: string, status: OrderDraft['status']): Promise<void>;
}

/** OTP 儲存介面。 */
export interface OtpStore {
  put(record: OtpRecord): Promise<void>;
  find(tenantId: string, phone: string): Promise<OtpRecord | undefined>;
  consume(tenantId: string, phone: string, at: Date): Promise<void>;
  /** 紀錄一次「發送」事件（給 rate-limit 用）。 */
  recordSend(tenantId: string, phone: string, at: Date): Promise<void>;
  /** 計算指定時窗內某 phone 的發送次數。 */
  countRecentSends(tenantId: string, phone: string, since: Date): Promise<number>;
}

/** 測試 / 本機用 in-memory 實作。 */
export class InMemoryOrderDraftStore implements OrderDraftStore {
  private drafts = new Map<string, OrderDraft>();

  async insert(draft: OrderDraft): Promise<void> {
    this.drafts.set(draft.id, draft);
  }

  async findById(id: string): Promise<OrderDraft | undefined> {
    return this.drafts.get(id);
  }

  async updateStatus(id: string, status: OrderDraft['status']): Promise<void> {
    const draft = this.drafts.get(id);
    if (!draft) throw new Error(`找不到訂單草稿：${id}`);
    this.drafts.set(id, { ...draft, status });
  }
}

/** 測試 / 本機用 in-memory OTP 實作。 */
export class InMemoryOtpStore implements OtpStore {
  private records = new Map<string, OtpRecord>();
  private sendLog = new Map<string, Date[]>();

  private key(tenantId: string, phone: string): string {
    return `${tenantId}|${phone}`;
  }

  async put(record: OtpRecord): Promise<void> {
    this.records.set(this.key(record.tenantId, record.phone), record);
  }

  async find(tenantId: string, phone: string): Promise<OtpRecord | undefined> {
    return this.records.get(this.key(tenantId, phone));
  }

  async consume(tenantId: string, phone: string, at: Date): Promise<void> {
    const rec = this.records.get(this.key(tenantId, phone));
    if (!rec) return;
    this.records.set(this.key(tenantId, phone), { ...rec, consumedAt: at });
  }

  async recordSend(tenantId: string, phone: string, at: Date): Promise<void> {
    const k = this.key(tenantId, phone);
    const arr = this.sendLog.get(k) ?? [];
    arr.push(at);
    this.sendLog.set(k, arr);
  }

  async countRecentSends(tenantId: string, phone: string, since: Date): Promise<number> {
    const arr = this.sendLog.get(this.key(tenantId, phone)) ?? [];
    return arr.filter((t) => t.getTime() >= since.getTime()).length;
  }
}
