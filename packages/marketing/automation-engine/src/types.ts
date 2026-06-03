/** 事件名稱（用 dot-notation：order.created / cart.abandoned）。 */
export type EventName = string;

/** 自動化事件。 */
export interface AutomationEvent {
  name: EventName;
  tenantId: string;
  /** 事件 payload（依事件類型不同）。 */
  payload: Record<string, unknown>;
  at: Date;
}

/** 條件葉節點：對 context 路徑的欄位做比較。 */
export interface ConditionLeaf {
  /** 從 context 取值的路徑，如 'order.totalMinor' 或 'customer.tier'。 */
  field: string;
  op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not-in' | 'exists' | 'not-exists';
  value?: unknown;
}

/** 組合條件。 */
export type Condition =
  | ConditionLeaf
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition };

/** Workflow 步驟。 */
export type WorkflowStep =
  | { kind: 'action'; action: string; params?: Record<string, unknown> }
  | { kind: 'delay'; delayMs: number }
  | { kind: 'gate'; condition: Condition; /** 不符合條件時跳過剩餘所有步驟。 */ onFalse: 'stop' | 'continue' };

/** Workflow 定義。 */
export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  enabled: boolean;
  trigger: {
    event: EventName;
    /** 觸發條件（不符合就不啟動 run）。 */
    conditions?: Condition;
  };
  steps: WorkflowStep[];
  createdAt: Date;
  updatedAt: Date;
}

/** Workflow run 狀態。 */
export type RunStatus = 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled';

/** 執行日誌條目。 */
export interface RunLogEntry {
  at: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  stepIndex?: number;
  error?: string;
}

/** Workflow run。 */
export interface WorkflowRun {
  id: string;
  workflowId: string;
  tenantId: string;
  triggerEvent: EventName;
  /** 從 trigger event 帶入的 context（後續 step 可讀）。 */
  context: Record<string, unknown>;
  /** 下個要執行的 step index。 */
  cursor: number;
  status: RunStatus;
  /** 若 waiting，下次可執行時間。 */
  resumeAt?: Date;
  logs: RunLogEntry[];
  /** 重試次數（action 失敗時累計）。 */
  attempts: number;
  startedAt: Date;
  updatedAt: Date;
  finishedAt?: Date;
}

/** 動作執行結果。 */
export interface ActionResult {
  ok: boolean;
  /** 寫回 context 的補充資料。 */
  contextPatch?: Record<string, unknown>;
  error?: string;
}

/** 動作處理函式。 */
export type ActionHandler = (
  params: Record<string, unknown>,
  context: Record<string, unknown>,
  run: WorkflowRun,
) => Promise<ActionResult>;

/** 排程器 hook：把 run 標 waiting + 設定 resumeAt，外部 worker 到時拉起。 */
export interface Scheduler {
  schedule(runId: string, resumeAt: Date): Promise<void>;
}
