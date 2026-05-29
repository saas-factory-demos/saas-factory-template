/**
 * Workflow 執行引擎（runtime executor）。
 *
 * 角色：對應 goal-07-marketing-automation 的「執行」階段。
 * Editor（apps/factory React Flow）只負責產資料；本檔負責把資料跑出來。
 *
 * 設計取向：
 * - **純函數 + 注入 dispatch**：執行流程本身不打網路，所有 side-effect 由
 *   `dispatchAction` 注入；測試時餵假 dispatch 即可斷言每個節點被呼叫的順序。
 * - **可暫停可續跑**：遇到 `delay` 節點不 sleep，而是回 `suspended` 狀態
 *   + `resumeAt`，由排程器（PR #193）擇期 resume。原因：serverless 不能塞長 sleep，
 *   也避免單一 workflow 卡住整批 worker。
 * - **單次步進不阻塞**：每次 `step()` 處理一個節點 → 回新的 RunState；
 *   呼叫者決定何時收手（執行上限 / 時間預算 / 等待外部訊號）。
 * - **失敗 fail-fast**：dispatch 回 `ok:false` → 整條 run 標記 `failed`，
 *   把 error 記在 log；不做自動 retry（重試交給 caller / scheduler 上層決定）。
 * - **context 是 immutable**：每步驟複製一份，避免節點互相污染。
 */

import { renderParams, DEFAULT_ALLOWED_VARS } from './template.js';

import type {
  ActionType,
  ConditionOperator,
  DelayUnit,
  Workflow,
  WorkflowEdge,
  WorkflowNode,
} from './index.js';

/** Dispatch action 結果。caller 可回需要塞回 context 的欄位。 */
export type DispatchResult =
  | { ok: true; output?: Record<string, unknown> }
  | { ok: false; error: string };

/** Action dispatch 注入點：caller 提供實作（HTTP / queue / inline）。 */
export type DispatchAction = (input: {
  actionType: ActionType;
  /** 已 render 完的 params（不含 `{{var}}`）。 */
  params: Record<string, string | number | boolean>;
  /** 唯讀 context 副本，動作可讀但不可寫。 */
  context: Readonly<Record<string, unknown>>;
}) => Promise<DispatchResult>;

/** Run 狀態。 */
export type RunStatus = 'running' | 'suspended' | 'completed' | 'failed';

/** 單一步驟 log。 */
export interface RunStep {
  nodeId: string;
  kind: 'trigger' | 'condition' | 'action' | 'delay' | 'branch';
  startedAt: Date;
  endedAt: Date;
  /** 動作執行結果（僅 action / condition / branch 有意義）。 */
  outcome?: 'ok' | 'true' | 'false' | 'error';
  /** 失敗訊息（outcome === 'error' 時）。 */
  error?: string;
}

/**
 * Run state：可序列化（Date 除外）。
 *
 * 為何不存整個 Workflow：scheduler resume 時用 workflowId 重撈即可。
 * 存太多會讓 row size 失控。
 */
export interface RunState {
  workflowId: string;
  status: RunStatus;
  /** 下一個要執行的節點 id；suspended/completed/failed 時為 undefined。 */
  cursor?: string;
  /** 累積 context（trigger payload + 每節點輸出）。 */
  context: Record<string, unknown>;
  /** 步驟歷史。 */
  log: RunStep[];
  /** suspended 時：何時可 resume。 */
  resumeAt?: Date;
  /** 啟始時間。 */
  startedAt: Date;
  /** 終止時間（completed / failed 時填）。 */
  endedAt?: Date;
}

/**
 * 初始化 RunState：從 trigger 節點開始。
 *
 * @throws 若 workflow 沒有 trigger 節點。
 */
export function initRunState(input: {
  workflow: Pick<Workflow, 'id' | 'nodes'>;
  /** Trigger payload。會合併進 context（key 由 caller 控）。 */
  triggerPayload: Record<string, unknown>;
  now: Date;
}): RunState {
  const trigger = input.workflow.nodes.find((n) => n.data.kind === 'trigger');
  if (!trigger) throw new Error('workflow 缺 trigger 節點');
  return {
    workflowId: input.workflow.id,
    status: 'running',
    cursor: trigger.id,
    context: { ...input.triggerPayload },
    log: [],
    startedAt: input.now,
  };
}

/**
 * 跑一步：從 `state.cursor` 處理一個節點 → 回新 state。
 *
 * 行為（依節點 kind）：
 * - trigger：標記 log + 跳到下一節點
 * - condition：算結果 → 沿著 source（無 sourceHandle）或對應 handle 跳
 * - action：呼叫 dispatch；失敗 → status='failed'；成功 → 合併 output 到 context
 * - delay：suspend，記 resumeAt
 * - branch：用 context.branch 決定走哪 handle（caller 須事先放 branch 值）
 *
 * 若節點無下一條 edge → completed。
 */
export async function step(
  state: RunState,
  workflow: Pick<Workflow, 'nodes' | 'edges'>,
  deps: { dispatchAction: DispatchAction; now: Date },
  opts: { allowedVars?: readonly string[] } = {},
): Promise<RunState> {
  if (state.status !== 'running') return state;
  const nodeId = state.cursor;
  if (!nodeId) {
    return { ...state, status: 'completed', endedAt: deps.now };
  }
  const node = workflow.nodes.find((n) => n.id === nodeId);
  if (!node) {
    return failed(state, deps.now, `節點不存在：${nodeId}`);
  }
  const allowed = opts.allowedVars ?? DEFAULT_ALLOWED_VARS;
  const startedAt = deps.now;

  if (node.data.kind === 'trigger') {
    const log: RunStep = {
      nodeId,
      kind: 'trigger',
      startedAt,
      endedAt: deps.now,
      outcome: 'ok',
    };
    return advance(state, workflow, node, undefined, log, deps.now);
  }

  if (node.data.kind === 'condition') {
    const value = renderConditionValue(node.data.value, state.context, allowed);
    const passed = evaluateCondition(
      readPath(state.context, node.data.field),
      node.data.operator,
      value,
    );
    const log: RunStep = {
      nodeId,
      kind: 'condition',
      startedAt,
      endedAt: deps.now,
      outcome: passed ? 'true' : 'false',
    };
    return advance(state, workflow, node, passed ? 'true' : 'false', log, deps.now);
  }

  if (node.data.kind === 'action') {
    let rendered: Record<string, string | number | boolean>;
    try {
      rendered = renderParams(node.data.params, state.context, { allowedVars: allowed });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return failed(state, deps.now, `param render 失敗：${msg}`, {
        nodeId,
        kind: 'action',
        startedAt,
        endedAt: deps.now,
        outcome: 'error',
        error: msg,
      });
    }
    const res = await deps.dispatchAction({
      actionType: node.data.actionType,
      params: rendered,
      context: state.context,
    });
    if (!res.ok) {
      return failed(state, deps.now, res.error, {
        nodeId,
        kind: 'action',
        startedAt,
        endedAt: deps.now,
        outcome: 'error',
        error: res.error,
      });
    }
    const nextContext = res.output
      ? { ...state.context, ...res.output }
      : state.context;
    const log: RunStep = {
      nodeId,
      kind: 'action',
      startedAt,
      endedAt: deps.now,
      outcome: 'ok',
    };
    return advance({ ...state, context: nextContext }, workflow, node, undefined, log, deps.now);
  }

  if (node.data.kind === 'delay') {
    const resumeAt = computeResumeAt(deps.now, node.data.duration, node.data.unit);
    const log: RunStep = {
      nodeId,
      kind: 'delay',
      startedAt,
      endedAt: deps.now,
      outcome: 'ok',
    };
    const next = findNextNodeId(workflow.edges, node, undefined);
    return {
      ...state,
      status: 'suspended',
      cursor: next,
      log: [...state.log, log],
      resumeAt,
    };
  }

  if (node.data.kind === 'branch') {
    // 用 context.__branch 決定走哪 handle；missing → 走第一條
    const choice = typeof state.context.__branch === 'string'
      ? (state.context.__branch as string)
      : node.data.branches[0];
    const log: RunStep = {
      nodeId,
      kind: 'branch',
      startedAt,
      endedAt: deps.now,
      outcome: 'ok',
    };
    return advance(state, workflow, node, choice, log, deps.now);
  }

  return failed(state, deps.now, `未知節點型別：${(node.data as { kind: string }).kind}`);
}

/**
 * 連跑直到 suspend / complete / fail，或達 maxSteps 上限。
 *
 * `maxSteps` 防無窮迴圈 + 控制單次 budget（serverless function 有時間上限）。
 */
export async function run(
  state: RunState,
  workflow: Pick<Workflow, 'nodes' | 'edges'>,
  deps: { dispatchAction: DispatchAction; now: () => Date },
  opts: { maxSteps?: number; allowedVars?: readonly string[] } = {},
): Promise<RunState> {
  const limit = opts.maxSteps ?? 100;
  let cur = state;
  for (let i = 0; i < limit; i++) {
    if (cur.status !== 'running') return cur;
    cur = await step(cur, workflow, { dispatchAction: deps.dispatchAction, now: deps.now() }, opts);
  }
  if (cur.status === 'running') {
    return failed(cur, deps.now(), `達執行步數上限 ${limit}（可能存在環）`);
  }
  return cur;
}

/**
 * 從 suspended 恢復：把 status 轉回 running 後交給 `run` 處理。
 *
 * @throws 若 state.status 非 'suspended'。
 */
export function resume(state: RunState): RunState {
  if (state.status !== 'suspended') {
    throw new Error(`只能恢復 suspended state，目前：${state.status}`);
  }
  return { ...state, status: 'running', resumeAt: undefined };
}

/* ------------------------------------------------------------------ *
 * 內部工具
 * ------------------------------------------------------------------ */

function advance(
  state: RunState,
  workflow: Pick<Workflow, 'nodes' | 'edges'>,
  from: WorkflowNode,
  handle: string | undefined,
  log: RunStep,
  now: Date,
): RunState {
  const next = findNextNodeId(workflow.edges, from, handle);
  const merged: RunState = {
    ...state,
    cursor: next,
    log: [...state.log, log],
  };
  if (!next) {
    return { ...merged, status: 'completed', endedAt: now };
  }
  return merged;
}

function failed(
  state: RunState,
  now: Date,
  error: string,
  extraLog?: RunStep,
): RunState {
  return {
    ...state,
    status: 'failed',
    endedAt: now,
    cursor: undefined,
    log: extraLog ? [...state.log, extraLog] : state.log,
    context: { ...state.context, __error: error },
  };
}

function findNextNodeId(
  edges: WorkflowEdge[],
  from: WorkflowNode,
  handle: string | undefined,
): string | undefined {
  const candidates = edges.filter((e) => e.source === from.id);
  if (handle === undefined) {
    return candidates.find((e) => !e.sourceHandle)?.target ?? candidates[0]?.target;
  }
  return candidates.find((e) => e.sourceHandle === handle)?.target;
}

function readPath(ctx: Record<string, unknown>, path: string): unknown {
  let cur: unknown = ctx;
  for (const seg of path.split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined;
    if (seg === '__proto__' || seg === 'constructor' || seg === 'prototype') return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

function renderConditionValue(
  value: string | number | boolean | Array<string | number>,
  context: Record<string, unknown>,
  allowed: readonly string[],
): string | number | boolean | Array<string | number> {
  if (typeof value !== 'string') return value;
  // 直接走 renderParams 同一條路徑：包成單 key 跑一次再取出
  const rendered = renderParams({ v: value }, context, { allowedVars: allowed });
  const v = rendered.v;
  // renderParams 對 string 一定回 string；不會 undefined
  return v ?? value;
}

/**
 * 條件運算：依 operator 比較 left / right。
 *
 * 設計：所有運算都 strict（不做 string→number 隱式轉），
 * caller 須在 condition 設計時就決定型別，避免 `"5" > 3` 這種陷阱。
 */
export function evaluateCondition(
  left: unknown,
  operator: ConditionOperator,
  right: string | number | boolean | Array<string | number>,
): boolean {
  switch (operator) {
    case 'eq':
      return left === right;
    case 'neq':
      return left !== right;
    case 'gt':
      return typeof left === 'number' && typeof right === 'number' && left > right;
    case 'gte':
      return typeof left === 'number' && typeof right === 'number' && left >= right;
    case 'lt':
      return typeof left === 'number' && typeof right === 'number' && left < right;
    case 'lte':
      return typeof left === 'number' && typeof right === 'number' && left <= right;
    case 'contains':
      if (typeof left === 'string' && typeof right === 'string') return left.includes(right);
      if (Array.isArray(left)) return left.some((x) => x === right);
      return false;
    case 'not-contains':
      if (typeof left === 'string' && typeof right === 'string') return !left.includes(right);
      if (Array.isArray(left)) return !left.some((x) => x === right);
      return true;
    case 'in':
      return Array.isArray(right) && right.some((x) => x === left);
    case 'not-in':
      return Array.isArray(right) && !right.some((x) => x === left);
    default:
      return false;
  }
}

function computeResumeAt(now: Date, duration: number, unit: DelayUnit): Date {
  const ms = duration * unitToMs(unit);
  return new Date(now.getTime() + ms);
}

function unitToMs(unit: DelayUnit): number {
  switch (unit) {
    case 'minute':
      return 60_000;
    case 'hour':
      return 3_600_000;
    case 'day':
      return 86_400_000;
    case 'week':
      return 604_800_000;
  }
}
