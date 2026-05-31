import type { Experiment, VariantStats } from './types.js';

/** 實驗儲存介面。 */
export interface ExperimentStore {
  insert(experiment: Experiment): Promise<void>;
  findById(id: string): Promise<Experiment | undefined>;
  update(experiment: Experiment): Promise<void>;
  listByPage(tenantId: string, pageId: string): Promise<Experiment[]>;
}

/** 流量分配記錄（讓同一訪客始終看到同一 variant）。 */
export interface AssignmentStore {
  /** 寫入指派（覆蓋）。 */
  put(input: {
    experimentId: string;
    visitorId: string;
    variantId: string;
    assignedAt: Date;
  }): Promise<void>;
  /** 查指派。 */
  get(experimentId: string, visitorId: string): Promise<string | undefined>;
}

/** 事件累計（visitors / conversions）。 */
export interface ExperimentMetricsStore {
  recordVisitor(experimentId: string, variantId: string): Promise<void>;
  recordConversion(experimentId: string, variantId: string): Promise<void>;
  stats(experimentId: string): Promise<VariantStats[]>;
}

/** In-memory 實作。 */
export class InMemoryExperimentStore implements ExperimentStore {
  private map = new Map<string, Experiment>();

  async insert(experiment: Experiment): Promise<void> {
    this.map.set(experiment.id, experiment);
  }

  async findById(id: string): Promise<Experiment | undefined> {
    return this.map.get(id);
  }

  async update(experiment: Experiment): Promise<void> {
    if (!this.map.has(experiment.id)) throw new Error(`找不到實驗：${experiment.id}`);
    this.map.set(experiment.id, experiment);
  }

  async listByPage(tenantId: string, pageId: string): Promise<Experiment[]> {
    return Array.from(this.map.values()).filter(
      (e) => e.tenantId === tenantId && e.pageId === pageId,
    );
  }
}

/** In-memory 指派儲存。 */
export class InMemoryAssignmentStore implements AssignmentStore {
  private map = new Map<string, string>();

  private key(experimentId: string, visitorId: string): string {
    return `${experimentId}|${visitorId}`;
  }

  async put(input: { experimentId: string; visitorId: string; variantId: string }): Promise<void> {
    this.map.set(this.key(input.experimentId, input.visitorId), input.variantId);
  }

  async get(experimentId: string, visitorId: string): Promise<string | undefined> {
    return this.map.get(this.key(experimentId, visitorId));
  }
}

/** In-memory metrics。 */
export class InMemoryExperimentMetricsStore implements ExperimentMetricsStore {
  private buckets = new Map<string, Map<string, { visitors: number; conversions: number }>>();

  private bucket(experimentId: string, variantId: string) {
    let inner = this.buckets.get(experimentId);
    if (!inner) {
      inner = new Map();
      this.buckets.set(experimentId, inner);
    }
    let b = inner.get(variantId);
    if (!b) {
      b = { visitors: 0, conversions: 0 };
      inner.set(variantId, b);
    }
    return b;
  }

  async recordVisitor(experimentId: string, variantId: string): Promise<void> {
    this.bucket(experimentId, variantId).visitors += 1;
  }

  async recordConversion(experimentId: string, variantId: string): Promise<void> {
    this.bucket(experimentId, variantId).conversions += 1;
  }

  async stats(experimentId: string): Promise<VariantStats[]> {
    const inner = this.buckets.get(experimentId);
    if (!inner) return [];
    return Array.from(inner.entries()).map(([variantId, b]) => ({
      variantId,
      visitors: b.visitors,
      conversions: b.conversions,
      conversionRate: b.visitors === 0 ? 0 : b.conversions / b.visitors,
    }));
  }
}
