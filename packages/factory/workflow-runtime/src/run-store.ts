import { and, asc, desc, eq, lte } from 'drizzle-orm';

import type { WorkflowRunsTable } from './schema.js';
import type { RunState } from '@saas-factory/factory-workflows';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

/**
 * Workflow run 持久化抽象。
 *
 * 為何抽介面：保留 in-memory 實作給單元測試 / 無 DB 場景，
 * 同時讓 caller（factory / template / 其他 app）可以塞自己的存法。
 */
export interface WorkflowRunStore {
  insert(state: RunState): Promise<void>;
  update(state: RunState): Promise<void>;
  findById(id: string): Promise<RunState | undefined>;
  /** 列出 status='suspended' AND resumeAt <= now 的 runs（按 resumeAt 升序）。 */
  listDue(now: Date, limit: number): Promise<RunState[]>;
  /** 某 workflow 最近 N 筆 runs（按 startedAt 降序，admin UI 用）。 */
  listByWorkflow(workflowId: string, limit: number): Promise<RunState[]>;
}

/**
 * 建立 Drizzle 實作。
 *
 * 為何不用 class：caller 自己有 DB / 表 reference，函式接這兩個值回 store
 * 比繼承 class 更乾淨；也不會強迫 caller 依賴 NodePgDatabase 具體型別。
 *
 * @param db Drizzle node-postgres database instance
 * @param table 由 defineWorkflowRunsTable() 建出的表
 */
export function createDrizzleWorkflowRunStore(
  db: NodePgDatabase<Record<string, unknown>>,
  table: WorkflowRunsTable,
): WorkflowRunStore {
  return {
    async insert(state: RunState): Promise<void> {
      const id = stateId(state);
      await db.insert(table).values({
        id,
        workflowId: state.workflowId,
        status: state.status,
        state: serialize(state),
        resumeAt: state.resumeAt ?? null,
        startedAt: state.startedAt,
        endedAt: state.endedAt ?? null,
      });
    },

    async update(state: RunState): Promise<void> {
      const id = stateId(state);
      const result = await db
        .update(table)
        .set({
          status: state.status,
          state: serialize(state),
          resumeAt: state.resumeAt ?? null,
          endedAt: state.endedAt ?? null,
        })
        .where(eq(table.id, id))
        .returning({ id: table.id });
      if (result.length === 0) {
        throw new Error(`run 不存在：${id}`);
      }
    },

    async findById(id: string): Promise<RunState | undefined> {
      const rows = await db.select().from(table).where(eq(table.id, id)).limit(1);
      const row = rows[0];
      return row ? deserialize(row.state) : undefined;
    },

    async listDue(now: Date, limit: number): Promise<RunState[]> {
      const rows = await db
        .select()
        .from(table)
        .where(and(eq(table.status, 'suspended'), lte(table.resumeAt, now)))
        .orderBy(asc(table.resumeAt))
        .limit(limit);
      return rows.map((r) => deserialize(r.state));
    },

    async listByWorkflow(workflowId: string, limit: number): Promise<RunState[]> {
      const rows = await db
        .select()
        .from(table)
        .where(eq(table.workflowId, workflowId))
        .orderBy(desc(table.startedAt))
        .limit(limit);
      return rows.map((r) => deserialize(r.state));
    },
  };
}

/** In-memory 實作（測試 + dev 無 DATABASE_URL 用）。 */
export class InMemoryWorkflowRunStore implements WorkflowRunStore {
  private map = new Map<string, RunState>();

  async insert(state: RunState): Promise<void> {
    const id = stateId(state);
    if (this.map.has(id)) throw new Error(`run 已存在：${id}`);
    this.map.set(id, state);
  }

  async update(state: RunState): Promise<void> {
    const id = stateId(state);
    if (!this.map.has(id)) throw new Error(`run 不存在：${id}`);
    this.map.set(id, state);
  }

  async findById(id: string): Promise<RunState | undefined> {
    return this.map.get(id);
  }

  async listDue(now: Date, limit: number): Promise<RunState[]> {
    return Array.from(this.map.values())
      .filter((s) => s.status === 'suspended' && s.resumeAt && s.resumeAt <= now)
      .sort((a, b) => a.resumeAt!.getTime() - b.resumeAt!.getTime())
      .slice(0, limit);
  }

  async listByWorkflow(workflowId: string, limit: number): Promise<RunState[]> {
    return Array.from(this.map.values())
      .filter((s) => s.workflowId === workflowId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }
}

/**
 * Run ID = workflowId + startedAt（避免同 workflow 多執行緒衝撞）。
 *
 * 為何不用 uuid：scheduler 把 RunState 拿來 update 時不持有獨立 id，
 * 用衍生 id 可直接從 state 算出，無需另存對映。
 */
export function stateId(state: RunState): string {
  return `${state.workflowId}:${state.startedAt.toISOString()}`;
}

function serialize(state: RunState): unknown {
  return {
    ...state,
    startedAt: state.startedAt.toISOString(),
    endedAt: state.endedAt?.toISOString() ?? null,
    resumeAt: state.resumeAt?.toISOString() ?? null,
    log: state.log.map((l) => ({
      ...l,
      startedAt: l.startedAt.toISOString(),
      endedAt: l.endedAt.toISOString(),
    })),
  };
}

function deserialize(raw: unknown): RunState {
  const r = raw as {
    workflowId: string;
    status: RunState['status'];
    cursor?: string;
    context: Record<string, unknown>;
    log: Array<{
      nodeId: string;
      kind: RunState['log'][number]['kind'];
      startedAt: string;
      endedAt: string;
      outcome?: RunState['log'][number]['outcome'];
      error?: string;
    }>;
    resumeAt: string | null;
    startedAt: string;
    endedAt: string | null;
  };
  return {
    workflowId: r.workflowId,
    status: r.status,
    cursor: r.cursor,
    context: r.context,
    log: r.log.map((l) => ({
      ...l,
      startedAt: new Date(l.startedAt),
      endedAt: new Date(l.endedAt),
    })),
    resumeAt: r.resumeAt ? new Date(r.resumeAt) : undefined,
    startedAt: new Date(r.startedAt),
    endedAt: r.endedAt ? new Date(r.endedAt) : undefined,
  };
}
