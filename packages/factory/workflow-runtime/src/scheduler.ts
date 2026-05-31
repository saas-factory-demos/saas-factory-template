import {
  initRunState,
  resume,
  run,
  type DispatchAction,
  type RunState,
  type WorkflowStore,
} from '@saas-factory/factory-workflows';

import type { WorkflowRunStore } from './run-store.js';

/**
 * Workflow 排程器：把 executor 的純粹 state machine 接到「時間」上。
 *
 * 兩個入口：
 * 1. `startRun(workflowId, triggerPayload)` — trigger 一條新 run（同步跑到 suspend / complete / fail）
 * 2. `tick(now)` — 處理到期 suspended runs（給 cron 用，預設批次 50）
 *
 * 設計取向：
 * - 一次 tick **只跑一輪 run()**：每個 run 內 executor 自己用 maxSteps 限制；
 *   多輪 tick 由 cron 間隔自然分攤，避免單次 invocation 撐爆 budget。
 * - tick 失敗的個別 run 不影響其他：用 try/catch 包單 run，記 error → 標 failed → 繼續下一個。
 */
export class WorkflowScheduler {
  constructor(
    private workflows: WorkflowStore,
    private runs: WorkflowRunStore,
    private dispatchAction: DispatchAction,
    private clock: () => Date = () => new Date(),
  ) {}

  /** 啟動一條新 run。回最終 state（可能 suspended）。 */
  async startRun(input: {
    workflowId: string;
    triggerPayload: Record<string, unknown>;
  }): Promise<RunState> {
    const wf = await this.workflows.findById(input.workflowId);
    if (!wf) throw new Error(`workflow 不存在：${input.workflowId}`);
    const now = this.clock();
    const initial = initRunState({
      workflow: wf,
      triggerPayload: input.triggerPayload,
      now,
    });
    await this.runs.insert(initial);
    const final = await run(initial, wf, {
      dispatchAction: this.dispatchAction,
      now: () => this.clock(),
    });
    await this.runs.update(final);
    return final;
  }

  /**
   * 跑一輪到期 runs。回 { processed, failed }。
   *
   * 為何不限 maxBatch=1：cron 間隔可能 5 分鐘，一輪只跑 1 條太慢；
   * 50 條夠在 10s 內跑完（多數 run 是 single-step resume → action → done）。
   */
  async tick(opts: { now?: Date; maxBatch?: number } = {}): Promise<{
    processed: number;
    failed: number;
  }> {
    const now = opts.now ?? this.clock();
    const limit = opts.maxBatch ?? 50;
    const due = await this.runs.listDue(now, limit);
    let failed = 0;
    for (const state of due) {
      try {
        const wf = await this.workflows.findById(state.workflowId);
        if (!wf) {
          await this.runs.update({
            ...state,
            status: 'failed',
            endedAt: this.clock(),
            context: { ...state.context, __error: `workflow 已不存在：${state.workflowId}` },
          });
          failed++;
          continue;
        }
        const resumed = resume(state);
        const next = await run(resumed, wf, {
          dispatchAction: this.dispatchAction,
          now: () => this.clock(),
        });
        await this.runs.update(next);
        if (next.status === 'failed') failed++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        await this.runs.update({
          ...state,
          status: 'failed',
          endedAt: this.clock(),
          context: { ...state.context, __error: msg },
        });
        failed++;
      }
    }
    return { processed: due.length, failed };
  }
}
