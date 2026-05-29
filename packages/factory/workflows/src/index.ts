/**
 * Workflow 節點圖型別 + InMemoryWorkflowStore。
 *
 * 對應 goal-07-marketing-automation：節點化 marketing automation 編輯器。
 * 本 package 只負責「資料模型 + 儲存層」。
 * 視覺化（React Flow）由 apps/factory 負責，執行引擎屬後續 goal。
 *
 * 節點 5 類（goal-07 §節點型別）：
 * - trigger：觸發點（signup / tag-added / page-viewed / form-submitted ...）
 * - condition：條件分歧（field operator value）
 * - action：動作（send-email / add-tag / create-task / webhook ...）
 * - delay：時間延遲（n 分/時/天）
 * - branch：明確 yes/no 分支（搭配 condition 使用）
 *
 * 設計取向：
 * - 節點資料 (`data`) 用 discriminated union 嚴格別型，前端編輯器可直接拿到型別補完
 * - 邊（edge）保持極簡：source / target / sourceHandle（給 branch yes/no 用）
 * - 不在儲存層做語意驗證（例：「trigger 是否唯一」）——交給 service layer / API
 */

/** 節點 5 類。 */
export type WorkflowNodeKind = 'trigger' | 'condition' | 'action' | 'delay' | 'branch';

/** 觸發類型（可日後擴充，先列 MVP 集合）。 */
export type TriggerType =
  | 'signup'
  | 'tag-added'
  | 'tag-removed'
  | 'page-viewed'
  | 'form-submitted'
  | 'order-placed'
  | 'manual';

/** 動作類型（goal-07 §動作集合 MVP）。 */
export type ActionType =
  | 'send-email'
  | 'add-tag'
  | 'remove-tag'
  | 'create-task'
  | 'webhook'
  | 'notify-admin';

/** 條件比較運算子。 */
export type ConditionOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'not-contains'
  | 'in'
  | 'not-in';

/** 延遲時間單位。 */
export type DelayUnit = 'minute' | 'hour' | 'day' | 'week';

interface BaseNodeData {
  /** 節點顯示名稱（編輯器內可改） */
  label: string;
}

export interface TriggerNodeData extends BaseNodeData {
  kind: 'trigger';
  triggerType: TriggerType;
  /** 觸發條件參數（例：tag-added 的 tagId、page-viewed 的 pagePath） */
  params?: Record<string, string | number | boolean>;
}

export interface ConditionNodeData extends BaseNodeData {
  kind: 'condition';
  field: string;
  operator: ConditionOperator;
  /** 比對值：純字串 / 數字 / 布林 / 陣列（in / not-in 用） */
  value: string | number | boolean | Array<string | number>;
}

export interface ActionNodeData extends BaseNodeData {
  kind: 'action';
  actionType: ActionType;
  /** 動作參數（例：send-email 的 templateId、add-tag 的 tagId） */
  params: Record<string, string | number | boolean>;
}

export interface DelayNodeData extends BaseNodeData {
  kind: 'delay';
  duration: number;
  unit: DelayUnit;
}

export interface BranchNodeData extends BaseNodeData {
  kind: 'branch';
  /** 分支標籤（給 sourceHandle 用，預設 ['yes', 'no']） */
  branches: string[];
}

export type WorkflowNodeData =
  | TriggerNodeData
  | ConditionNodeData
  | ActionNodeData
  | DelayNodeData
  | BranchNodeData;

/** Workflow 節點。位置欄位給 React Flow 用。 */
export interface WorkflowNode {
  id: string;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

/** Workflow 邊（連接線）。sourceHandle 用於 branch 節點區分 yes / no。 */
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  label?: string;
}

/** Workflow 啟用狀態。 */
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

/** Workflow 完整資料模型。 */
export interface Workflow {
  id: string;
  /** 屬於哪個 project（apps/factory 的 Project.id） */
  projectId: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStore {
  insert(w: Workflow): Promise<void>;
  update(w: Workflow): Promise<void>;
  findById(id: string): Promise<Workflow | undefined>;
  listByProject(projectId: string): Promise<Workflow[]>;
  delete(id: string): Promise<void>;
}

/** In-memory 儲存（dev / 測試用，未來換 Payload collection）。 */
export class InMemoryWorkflowStore implements WorkflowStore {
  private map = new Map<string, Workflow>();

  async insert(w: Workflow): Promise<void> {
    if (this.map.has(w.id)) throw new Error(`workflow 已存在：${w.id}`);
    this.map.set(w.id, w);
  }

  async update(w: Workflow): Promise<void> {
    if (!this.map.has(w.id)) throw new Error(`workflow 不存在：${w.id}`);
    this.map.set(w.id, w);
  }

  async findById(id: string): Promise<Workflow | undefined> {
    return this.map.get(id);
  }

  async listByProject(projectId: string): Promise<Workflow[]> {
    return Array.from(this.map.values())
      .filter((w) => w.projectId === projectId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async delete(id: string): Promise<void> {
    this.map.delete(id);
  }
}

/**
 * 驗證 workflow 結構合理性。回傳錯誤訊息陣列，空陣列即合法。
 *
 * 規則：
 * - 必須恰好一個 trigger 節點（marketing automation 必有起點）
 * - 所有 edge 的 source/target 都要指向存在的節點
 * - 不可有自指 edge（source === target）
 * - 同 node 同 sourceHandle 不可有多條相同 target 的 edge（去重）
 */
export function validateWorkflow(w: Pick<Workflow, 'nodes' | 'edges'>): string[] {
  const errors: string[] = [];
  const triggers = w.nodes.filter((n) => n.data.kind === 'trigger');
  if (triggers.length === 0) errors.push('workflow 必須包含至少一個 trigger 節點');
  if (triggers.length > 1) errors.push('workflow 只能有一個 trigger 節點');

  const nodeIds = new Set(w.nodes.map((n) => n.id));
  const seenEdgeKey = new Set<string>();
  for (const e of w.edges) {
    if (!nodeIds.has(e.source)) errors.push(`edge ${e.id} 的 source ${e.source} 不存在`);
    if (!nodeIds.has(e.target)) errors.push(`edge ${e.id} 的 target ${e.target} 不存在`);
    if (e.source === e.target) errors.push(`edge ${e.id} 不可自指（${e.source}）`);
    const key = `${e.source}|${e.sourceHandle ?? ''}|${e.target}`;
    if (seenEdgeKey.has(key)) errors.push(`重複 edge：${key}`);
    seenEdgeKey.add(key);
  }
  return errors;
}

/**
 * 產一個空 workflow（含一個 manual trigger 占位節點）。
 * 新建 workflow 時呼叫，讓使用者進到編輯器立刻看到起始節點。
 */
export function createEmptyWorkflow(input: {
  id: string;
  projectId: string;
  name: string;
  now: Date;
}): Workflow {
  return {
    id: input.id,
    projectId: input.projectId,
    name: input.name,
    status: 'draft',
    nodes: [
      {
        id: 'trigger-1',
        position: { x: 80, y: 80 },
        data: { kind: 'trigger', label: '手動觸發', triggerType: 'manual' },
      },
    ],
    edges: [],
    createdAt: input.now,
    updatedAt: input.now,
  };
}

export {
  DEFAULT_ALLOWED_VARS,
  extractVariables,
  renderParams,
  renderTemplate,
  validateTemplate,
  validateWorkflowTemplates,
} from './template.js';
export type { RenderOptions } from './template.js';

export {
  evaluateCondition,
  initRunState,
  resume,
  run,
  step,
} from './executor.js';
export type {
  DispatchAction,
  DispatchResult,
  RunState,
  RunStatus,
  RunStep,
} from './executor.js';
