import { evalCondition } from './condition.js';

import type { WorkflowRunStore } from './in-memory-store.js';
import type {
  ActionHandler,
  Scheduler,
  WorkflowRun,
  WorkflowStep,
} from './types.js';

export interface StepDeps {
  runs: WorkflowRunStore;
  actions: Record<string, ActionHandler>;
  scheduler: Scheduler;
  maxAttempts: number;
  now: () => Date;
}

/** 執行單個 action step。 */
export async function execAction(
  deps: StepDeps,
  run: WorkflowRun,
  step: Extract<WorkflowStep, { kind: 'action' }>,
): Promise<WorkflowRun> {
  const handler = deps.actions[step.action];
  if (!handler) {
    const failed: WorkflowRun = {
      ...run,
      status: 'failed',
      finishedAt: deps.now(),
      updatedAt: deps.now(),
      logs: [
        ...run.logs,
        {
          at: deps.now(),
          level: 'error',
          message: `找不到動作：${step.action}`,
          stepIndex: run.cursor,
        },
      ],
    };
    await deps.runs.update(failed);
    return failed;
  }
  try {
    const result = await handler(step.params ?? {}, run.context, run);
    if (!result.ok) {
      return handleActionFailure(deps, run, step.action, result.error ?? 'action returned ok=false');
    }
    const updated: WorkflowRun = {
      ...run,
      cursor: run.cursor + 1,
      attempts: 0,
      context: { ...run.context, ...(result.contextPatch ?? {}) },
      updatedAt: deps.now(),
      logs: [
        ...run.logs,
        { at: deps.now(), level: 'info', message: `動作 ${step.action} 成功`, stepIndex: run.cursor },
      ],
    };
    await deps.runs.update(updated);
    return updated;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return handleActionFailure(deps, run, step.action, message);
  }
}

/** 動作失敗處理：重試上限內排 waiting + scheduler.schedule，超過則 failed。 */
export async function handleActionFailure(
  deps: StepDeps,
  run: WorkflowRun,
  action: string,
  error: string,
): Promise<WorkflowRun> {
  const nextAttempts = run.attempts + 1;
  if (nextAttempts >= deps.maxAttempts) {
    const failed: WorkflowRun = {
      ...run,
      status: 'failed',
      attempts: nextAttempts,
      finishedAt: deps.now(),
      updatedAt: deps.now(),
      logs: [
        ...run.logs,
        {
          at: deps.now(),
          level: 'error',
          message: `動作 ${action} 重試 ${nextAttempts} 次後失敗`,
          stepIndex: run.cursor,
          error,
        },
      ],
    };
    await deps.runs.update(failed);
    return failed;
  }
  // 指數退避：每次延遲翻倍（30s、60s、120s）
  const delayMs = 30_000 * 2 ** (nextAttempts - 1);
  const resumeAt = new Date(deps.now().getTime() + delayMs);
  const waiting: WorkflowRun = {
    ...run,
    status: 'waiting',
    attempts: nextAttempts,
    resumeAt,
    updatedAt: deps.now(),
    logs: [
      ...run.logs,
      {
        at: deps.now(),
        level: 'warn',
        message: `動作 ${action} 失敗，第 ${nextAttempts} 次重試將於 ${resumeAt.toISOString()} 進行`,
        stepIndex: run.cursor,
        error,
      },
    ],
  };
  await deps.runs.update(waiting);
  await deps.scheduler.schedule(run.id, resumeAt);
  return waiting;
}

/** 執行 delay step。 */
export async function execDelay(
  deps: StepDeps,
  run: WorkflowRun,
  step: Extract<WorkflowStep, { kind: 'delay' }>,
): Promise<WorkflowRun> {
  const resumeAt = new Date(deps.now().getTime() + step.delayMs);
  const waiting: WorkflowRun = {
    ...run,
    status: 'waiting',
    cursor: run.cursor + 1,
    resumeAt,
    updatedAt: deps.now(),
    logs: [
      ...run.logs,
      {
        at: deps.now(),
        level: 'info',
        message: `延遲 ${step.delayMs}ms 到 ${resumeAt.toISOString()}`,
        stepIndex: run.cursor,
      },
    ],
  };
  await deps.runs.update(waiting);
  await deps.scheduler.schedule(run.id, resumeAt);
  return waiting;
}

/** 執行 gate step（條件 true → 推進；false → continue 或 stop）。 */
export async function execGate(
  deps: StepDeps,
  run: WorkflowRun,
  step: Extract<WorkflowStep, { kind: 'gate' }>,
): Promise<WorkflowRun> {
  const passed = evalCondition(step.condition, run.context);
  if (passed) {
    const updated: WorkflowRun = {
      ...run,
      cursor: run.cursor + 1,
      updatedAt: deps.now(),
      logs: [
        ...run.logs,
        { at: deps.now(), level: 'info', message: '條件通過', stepIndex: run.cursor },
      ],
    };
    await deps.runs.update(updated);
    return updated;
  }
  if (step.onFalse === 'continue') {
    const updated: WorkflowRun = {
      ...run,
      cursor: run.cursor + 1,
      updatedAt: deps.now(),
      logs: [
        ...run.logs,
        { at: deps.now(), level: 'info', message: '條件不符，繼續下一步', stepIndex: run.cursor },
      ],
    };
    await deps.runs.update(updated);
    return updated;
  }
  const stopped: WorkflowRun = {
    ...run,
    status: 'completed',
    finishedAt: deps.now(),
    updatedAt: deps.now(),
    logs: [
      ...run.logs,
      { at: deps.now(), level: 'info', message: '條件不符，停止 workflow', stepIndex: run.cursor },
    ],
  };
  await deps.runs.update(stopped);
  return stopped;
}

/** Dispatch step → 對應 executor。 */
export async function runStep(
  deps: StepDeps,
  run: WorkflowRun,
  step: WorkflowStep,
): Promise<WorkflowRun> {
  switch (step.kind) {
    case 'action':
      return execAction(deps, run, step);
    case 'delay':
      return execDelay(deps, run, step);
    case 'gate':
      return execGate(deps, run, step);
  }
}
