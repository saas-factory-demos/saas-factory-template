import { createHash } from 'node:crypto';

import { zTestProportions } from './significance.js';

import type {
  AssignmentStore,
  ExperimentMetricsStore,
  ExperimentStore,
} from './in-memory-store.js';
import type { Experiment, ExperimentVariant, SignificanceResult, VariantStats } from './types.js';

/**
 * 由 visitorId + experimentId 推導出 [0, 1) 的決定性數字。
 *
 * 為何不用 Math.random：assignment 寫入若有延遲或失敗，同一訪客在多次請求中
 * 會被分到不同 variant，污染轉換率。決定性 hash 確保「即使 store 拿不到記錄，
 * 同訪客 + 同實驗永遠落在同一桶」。
 */
function deterministicBucket(visitorId: string, experimentId: string): number {
  const hash = createHash('sha256').update(`${experimentId}|${visitorId}`).digest();
  // 取前 4 byte 當 uint32，除以 2^32 得到 [0, 1)
  const n = hash.readUInt32BE(0);
  return n / 0x1_0000_0000;
}

/** A/B 測試服務。 */
export class AbTestingService {
  constructor(
    private readonly experiments: ExperimentStore,
    private readonly assignments: AssignmentStore,
    private readonly metrics: ExperimentMetricsStore,
    private readonly options: {
      now?: () => Date;
      random?: () => number;
      genId?: () => string;
    } = {},
  ) {}

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private random(): number {
    return this.options.random ? this.options.random() : Math.random();
  }

  private genId(): string {
    return this.options.genId ? this.options.genId() : `ex_${Math.random().toString(36).slice(2, 10)}`;
  }

  /** 建立草稿實驗。會驗證 weight 加總 = 1。 */
  async create(
    input: Omit<Experiment, 'id' | 'status' | 'startedAt' | 'concludedAt' | 'winningVariantId'>,
  ): Promise<Experiment> {
    const sum = input.variants.reduce((s, v) => s + v.trafficWeight, 0);
    if (Math.abs(sum - 1) > 1e-6) {
      throw new Error(`variants trafficWeight 加總必須等於 1，目前 ${sum}`);
    }
    if (input.variants.length < 2) {
      throw new Error('A/B 實驗至少需要 2 個變體');
    }
    const experiment: Experiment = { ...input, id: this.genId(), status: 'draft' };
    await this.experiments.insert(experiment);
    return experiment;
  }

  /** 啟動實驗。 */
  async start(id: string): Promise<Experiment> {
    const exp = await this.requireExperiment(id);
    if (exp.status === 'running') return exp;
    if (exp.status === 'concluded') throw new Error('已結束的實驗不能再啟動');
    const updated: Experiment = { ...exp, status: 'running', startedAt: this.now() };
    await this.experiments.update(updated);
    return updated;
  }

  /** 暫停實驗。 */
  async pause(id: string): Promise<Experiment> {
    const exp = await this.requireExperiment(id);
    if (exp.status !== 'running') throw new Error('只有 running 實驗能暫停');
    const updated: Experiment = { ...exp, status: 'paused' };
    await this.experiments.update(updated);
    return updated;
  }

  /** 為訪客指派變體；同訪客重複呼叫永遠拿到同一變體。 */
  async assign(experimentId: string, visitorId: string): Promise<ExperimentVariant> {
    const exp = await this.requireExperiment(experimentId);
    if (exp.status !== 'running') {
      // 非 running 也回第一個 variant（給後台預覽用）
      return exp.variants[0]!;
    }
    const existing = await this.assignments.get(experimentId, visitorId);
    if (existing) {
      const v = exp.variants.find((x) => x.id === existing);
      if (v) return v;
    }
    const variant = this.pickByWeight(exp.variants, deterministicBucket(visitorId, experimentId));
    await this.assignments.put({
      experimentId,
      visitorId,
      variantId: variant.id,
      assignedAt: this.now(),
    });
    await this.metrics.recordVisitor(experimentId, variant.id);
    return variant;
  }

  /** 記錄轉換（例：成單）。 */
  async recordConversion(experimentId: string, visitorId: string): Promise<void> {
    const variantId = await this.assignments.get(experimentId, visitorId);
    if (!variantId) return;
    await this.metrics.recordConversion(experimentId, variantId);
  }

  /** 統計每個 variant 的轉換率 + 與 baseline 的顯著性（baseline = variants[0]）。 */
  async report(experimentId: string): Promise<{
    stats: VariantStats[];
    significance: SignificanceResult[];
  }> {
    const exp = await this.requireExperiment(experimentId);
    const stats = await this.metrics.stats(experimentId);
    const baseline = stats.find((s) => s.variantId === exp.variants[0]!.id);
    const significance: SignificanceResult[] = [];
    if (baseline) {
      for (const v of exp.variants.slice(1)) {
        const challenger = stats.find((s) => s.variantId === v.id);
        if (!challenger) continue;
        significance.push(zTestProportions(baseline, challenger, exp.significanceLevel));
      }
    }
    return { stats, significance };
  }

  /** 自動結束：若達 minSamplesPerVariant 且有顯著贏家，標 concluded。 */
  async autoConclude(experimentId: string): Promise<Experiment> {
    const exp = await this.requireExperiment(experimentId);
    if (exp.status !== 'running') return exp;
    const { stats, significance } = await this.report(experimentId);
    const enoughSamples = stats.every((s) => s.visitors >= exp.minSamplesPerVariant);
    if (!enoughSamples) return exp;
    const sigWin = significance.find(
      (s) => s.significant && s.uplift > 0,
    );
    if (!sigWin) return exp;
    return this.conclude(experimentId, sigWin.challengerId);
  }

  /** 手動結束並指定贏家。 */
  async conclude(experimentId: string, winningVariantId: string): Promise<Experiment> {
    const exp = await this.requireExperiment(experimentId);
    if (!exp.variants.some((v) => v.id === winningVariantId)) {
      throw new Error(`不存在的 variant：${winningVariantId}`);
    }
    const updated: Experiment = {
      ...exp,
      status: 'concluded',
      concludedAt: this.now(),
      winningVariantId,
    };
    await this.experiments.update(updated);
    return updated;
  }

  /**
   * 依 trafficWeight 把 [0, 1) 的隨機值對應到一個 variant。
   * 在 `assign` 流程中，r 由 visitorId 決定（決定性），不再用 Math.random。
   */
  private pickByWeight(variants: ExperimentVariant[], r: number = this.random()): ExperimentVariant {
    let remaining = r;
    for (const v of variants) {
      remaining -= v.trafficWeight;
      if (remaining <= 0) return v;
    }
    return variants[variants.length - 1]!;
  }

  private async requireExperiment(id: string): Promise<Experiment> {
    const exp = await this.experiments.findById(id);
    if (!exp) throw new Error(`找不到實驗：${id}`);
    return exp;
  }
}
