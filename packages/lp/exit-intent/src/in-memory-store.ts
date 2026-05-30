import type { VisitorExitState } from './types.js';

/** 訪客狀態儲存介面（生產建議用 KV / Redis）。 */
export interface VisitorExitStateStore {
  get(visitorId: string, pageId: string): Promise<VisitorExitState | undefined>;
  put(state: VisitorExitState): Promise<void>;
}

/** Lead 儲存介面。 */
export interface ExitLeadStore {
  save(input: {
    tenantId: string;
    pageId: string;
    visitorId: string;
    variantId: string;
    email?: string;
    phone?: string;
    capturedAt: Date;
  }): Promise<void>;
  list(tenantId: string, pageId: string): Promise<
    Array<{ visitorId: string; email?: string; phone?: string; capturedAt: Date }>
  >;
}

/** 觸發統計儲存。 */
export interface ExitStatsStore {
  recordTrigger(tenantId: string, pageId: string, variantId: string): Promise<void>;
  recordCapture(tenantId: string, pageId: string, variantId: string): Promise<void>;
  stats(tenantId: string, pageId: string): Promise<
    Array<{ variantId: string; triggers: number; captures: number; conversionRate: number }>
  >;
}

/** In-memory 訪客狀態實作。 */
export class InMemoryVisitorExitStateStore implements VisitorExitStateStore {
  private map = new Map<string, VisitorExitState>();

  private key(visitorId: string, pageId: string): string {
    return `${visitorId}|${pageId}`;
  }

  async get(visitorId: string, pageId: string): Promise<VisitorExitState | undefined> {
    return this.map.get(this.key(visitorId, pageId));
  }

  async put(state: VisitorExitState): Promise<void> {
    this.map.set(this.key(state.visitorId, state.pageId), state);
  }
}

/** In-memory Lead 儲存。 */
export class InMemoryExitLeadStore implements ExitLeadStore {
  private leads = new Map<string, Array<{
    visitorId: string;
    variantId: string;
    email?: string;
    phone?: string;
    capturedAt: Date;
  }>>();

  private key(tenantId: string, pageId: string): string {
    return `${tenantId}|${pageId}`;
  }

  async save(input: {
    tenantId: string;
    pageId: string;
    visitorId: string;
    variantId: string;
    email?: string;
    phone?: string;
    capturedAt: Date;
  }): Promise<void> {
    const k = this.key(input.tenantId, input.pageId);
    const list = this.leads.get(k) ?? [];
    list.push({
      visitorId: input.visitorId,
      variantId: input.variantId,
      email: input.email,
      phone: input.phone,
      capturedAt: input.capturedAt,
    });
    this.leads.set(k, list);
  }

  async list(tenantId: string, pageId: string) {
    return (this.leads.get(this.key(tenantId, pageId)) ?? []).map((l) => ({
      visitorId: l.visitorId,
      email: l.email,
      phone: l.phone,
      capturedAt: l.capturedAt,
    }));
  }
}

/** In-memory 觸發統計。 */
export class InMemoryExitStatsStore implements ExitStatsStore {
  private map = new Map<string, Map<string, { triggers: number; captures: number }>>();

  private key(tenantId: string, pageId: string): string {
    return `${tenantId}|${pageId}`;
  }

  private bucket(tenantId: string, pageId: string, variantId: string) {
    const k = this.key(tenantId, pageId);
    let inner = this.map.get(k);
    if (!inner) {
      inner = new Map();
      this.map.set(k, inner);
    }
    let b = inner.get(variantId);
    if (!b) {
      b = { triggers: 0, captures: 0 };
      inner.set(variantId, b);
    }
    return b;
  }

  async recordTrigger(tenantId: string, pageId: string, variantId: string): Promise<void> {
    this.bucket(tenantId, pageId, variantId).triggers += 1;
  }

  async recordCapture(tenantId: string, pageId: string, variantId: string): Promise<void> {
    this.bucket(tenantId, pageId, variantId).captures += 1;
  }

  async stats(tenantId: string, pageId: string) {
    const inner = this.map.get(this.key(tenantId, pageId));
    if (!inner) return [];
    return Array.from(inner.entries()).map(([variantId, b]) => ({
      variantId,
      triggers: b.triggers,
      captures: b.captures,
      conversionRate: b.triggers === 0 ? 0 : b.captures / b.triggers,
    }));
  }
}
