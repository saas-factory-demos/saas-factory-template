import { randomBytes } from 'node:crypto';

import { evalCondition } from './condition.js';
import { runStep, type StepDeps } from './steps.js';

import type { WorkflowRunStore, WorkflowStore } from './in-memory-store.js';
import type {
  ActionHandler,
  AutomationEvent,
  Scheduler,
  Workflow,
  WorkflowRun,
  WorkflowStep,
} from './types.js';

/** 引擎設定。 */
export interface EngineOptions {
  /** 動作 handler 註冊表。 */
  actions: Record<string, ActionHandler>;
  /** 延遲排程 hook。 */
  scheduler: Scheduler;
  /** 失敗最多重試幾次。 */
  maxAttempts?: number;
  now?: () => Date;
  genId?: () => string;
}

/** 自動化引擎。 */
export class AutomationEngine {
  private readonly maxAttempts: number;

  constructor(
    private readonly workflows: WorkflowStore,
    private readonly runs: WorkflowRunStore,
    private readonly options: EngineOptions,
  ) {
    this.maxAttempts = options.maxAttempts ?? 3;
  }

  private now(): Date {
    return this.options.now ? this.options.now() : new Date();
  }

  private genId(): string {
    return this.options.genId ? this.options.genId() : `run_${randomBytes(5).toString('hex')}`;
  }

  private stepDeps(): StepDeps {
    return {
      runs: this.runs,
      actions: this.options.actions,
      scheduler: this.options.scheduler,
      maxAttempts: this.maxAttempts,
      now: () => this.now(),
    };
  }

  /** 註冊新 workflow（產生 id + 寫入儲存）。 */
  async createWorkflow(input: {
    tenantId: string;
    name: string;
    trigger: Workflow['trigger'];
    steps: WorkflowStep[];
    enabled?: boolean;
    id?: string;
  }): Promise<Workflow> {
    const w: Workflow = {
      id: input.id ?? this.genId(),
      tenantId: input.tenantId,
      name: input.name,
      enabled: input.enabled ?? true,
      trigger: input.trigger,
      steps: input.steps,
      createdAt: this.now(),
      updatedAt: this.now(),
    };
    await this.workflows.insert(w);
    return w;
  }

  /** 發送事件 → 找到符合的 workflow → 建立 run → 立即執行到 waiting 或 finished。 */
  async dispatch(event: AutomationEvent): Promise<WorkflowRun[]> {
    const matched = await this.workflows.listEnabledByEvent(event.tenantId, event.name);
    const spawned: WorkflowRun[] = [];
    for (const w of matched) {
      if (w.trigger.conditions && !evalCondition(w.trigger.conditions, event.payload)) {
        continue;
      }
      const run: WorkflowRun = {
        id: this.genId(),
        workflowId: w.id,
        tenantId: w.tenantId,
        triggerEvent: event.name,
        context: { ...event.payload, _event: { name: event.name, at: event.at } },
        cursor: 0,
        status: 'running',
        logs: [
          {
            at: this.now(),
            level: 'info',
            message: `事件 ${event.name} 觸發 workflow「${w.name}」`,
          },
        ],
        attempts: 0,
        startedAt: this.now(),
        updatedAt: this.now(),
      };
      await this.runs.insert(run);
      await this.advance(run.id);
      const after = await this.runs.findById(run.id);
      if (after) spawned.push(after);
    }
    return spawned;
  }

  /** 推進 run 到下個 waiting / completed / failed 邊界。 */
  async advance(runId: string): Promise<WorkflowRun> {
    let run = await this.requireRun(runId);
    const workflow = await this.workflows.findById(run.workflowId);
    if (!workflow) throw new Error(`找不到 workflow：${run.workflowId}`);
    if (run.status !== 'running') return run;

    const deps = this.stepDeps();
    while (run.status === 'running' && run.cursor < workflow.steps.length) {
      const step = workflow.steps[run.cursor];
      if (!step) break;
      run = await runStep(deps, run, step);
    }
    if (run.status === 'running' && run.cursor >= workflow.steps.length) {
      run = {
        ...run,
        status: 'completed',
        finishedAt: this.now(),
        updatedAt: this.now(),
        logs: [...run.logs, { at: this.now(), level: 'info', message: 'workflow 完成' }],
      };
      await this.runs.update(run);
    }
    return run;
  }

  /** Worker 拉起到時的 waiting run。 */
  async resumeDue(now: Date = this.now()): Promise<WorkflowRun[]> {
    const due = await this.runs.listDueWaiting(now);
    const resumed: WorkflowRun[] = [];
    for (const r of due) {
      const updated: WorkflowRun = { ...r, status: 'running', resumeAt: undefined, updatedAt: this.now() };
      await this.runs.update(updated);
      resumed.push(await this.advance(r.id));
    }
    return resumed;
  }

  /** 取消 run。 */
  async cancel(runId: string, reason: string): Promise<WorkflowRun> {
    const r = await this.requireRun(runId);
    const updated: WorkflowRun = {
      ...r,
      status: 'cancelled',
      finishedAt: this.now(),
      updatedAt: this.now(),
      logs: [...r.logs, { at: this.now(), level: 'warn', message: `取消：${reason}` }],
    };
    await this.runs.update(updated);
    return updated;
  }

  private async requireRun(id: string): Promise<WorkflowRun> {
    const r = await this.runs.findById(id);
    if (!r) throw new Error(`找不到 run：${id}`);
    return r;
  }
}
