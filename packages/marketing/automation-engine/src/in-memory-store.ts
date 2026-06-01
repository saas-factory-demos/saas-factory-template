import type { Workflow, WorkflowRun } from './types.js';

/** Workflow 儲存介面。 */
export interface WorkflowStore {
  insert(w: Workflow): Promise<void>;
  update(w: Workflow): Promise<void>;
  findById(id: string): Promise<Workflow | undefined>;
  listEnabledByEvent(tenantId: string, event: string): Promise<Workflow[]>;
}

/** Run 儲存介面。 */
export interface WorkflowRunStore {
  insert(r: WorkflowRun): Promise<void>;
  update(r: WorkflowRun): Promise<void>;
  findById(id: string): Promise<WorkflowRun | undefined>;
  listDueWaiting(now: Date): Promise<WorkflowRun[]>;
  listByWorkflow(workflowId: string): Promise<WorkflowRun[]>;
}

/** Workflow in-memory 實作。 */
export class InMemoryWorkflowStore implements WorkflowStore {
  private map = new Map<string, Workflow>();

  async insert(w: Workflow): Promise<void> {
    this.map.set(w.id, w);
  }

  async update(w: Workflow): Promise<void> {
    if (!this.map.has(w.id)) throw new Error(`找不到 workflow：${w.id}`);
    this.map.set(w.id, w);
  }

  async findById(id: string): Promise<Workflow | undefined> {
    return this.map.get(id);
  }

  async listEnabledByEvent(tenantId: string, event: string): Promise<Workflow[]> {
    return Array.from(this.map.values()).filter(
      (w) => w.tenantId === tenantId && w.enabled && w.trigger.event === event,
    );
  }
}

/** Run in-memory 實作。 */
export class InMemoryWorkflowRunStore implements WorkflowRunStore {
  private map = new Map<string, WorkflowRun>();

  async insert(r: WorkflowRun): Promise<void> {
    this.map.set(r.id, r);
  }

  async update(r: WorkflowRun): Promise<void> {
    if (!this.map.has(r.id)) throw new Error(`找不到 run：${r.id}`);
    this.map.set(r.id, r);
  }

  async findById(id: string): Promise<WorkflowRun | undefined> {
    return this.map.get(id);
  }

  async listDueWaiting(now: Date): Promise<WorkflowRun[]> {
    return Array.from(this.map.values()).filter(
      (r) => r.status === 'waiting' && r.resumeAt !== undefined && r.resumeAt <= now,
    );
  }

  async listByWorkflow(workflowId: string): Promise<WorkflowRun[]> {
    return Array.from(this.map.values()).filter((r) => r.workflowId === workflowId);
  }
}
