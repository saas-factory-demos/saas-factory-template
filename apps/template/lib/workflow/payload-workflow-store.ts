import type { Workflow, WorkflowEdge, WorkflowNode, WorkflowStore } from '@saas-factory/factory-workflows';
import type { Payload } from 'payload';

/**
 * WorkflowStore 介接層：把 factory-workflows 的純 WorkflowStore 介面接到
 * template 端的 Payload workflow-registry collection。
 *
 * 為何 read-only 為主：
 * - factory-workflows 的 WorkflowStore 介面含 insert / update / delete，但 template
 *   端 stage 2 還沒接「客戶在後台編 workflow」這條（stage 3 才做）；現階段資料
 *   來源仍是 factory HMAC push（POST /api/workflows/registry）。
 * - 為避免 runtime 從 Payload 寫回 registry 造成循環（push → store.insert → push），
 *   本 adapter 的 insert/update/delete 全部 throw；scheduler 只需 findById /
 *   listByProject，OK 跑得起來。
 *
 * 為何 filter activeVersion=true：同 workflowId 可能有多版本，trigger 只跑當前生效版。
 *
 * id 對映：scheduler 拿到的是 `workflowId`（factory 那邊的 id 字串），
 * template 端 doc.id 是 Payload 自動 numeric id，兩者不同；findById 用
 * `where workflowId = ?` 查。
 */

interface RegistryDoc {
  id: number | string;
  workflowId: string;
  projectId: string;
  version: string;
  activeVersion?: boolean | null;
  name: string;
  description?: string | null;
  status: 'draft' | 'active' | 'paused' | 'archived';
  nodes: unknown;
  edges: unknown;
  pushedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

function toWorkflow(doc: RegistryDoc): Workflow {
  return {
    id: doc.workflowId,
    projectId: doc.projectId,
    name: doc.name,
    description: doc.description ?? undefined,
    status: doc.status,
    nodes: doc.nodes as WorkflowNode[],
    edges: doc.edges as WorkflowEdge[],
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(doc.pushedAt),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : new Date(doc.pushedAt),
  };
}

export function createPayloadWorkflowStore(payload: Payload): WorkflowStore {
  return {
    async insert(): Promise<void> {
      throw new Error(
        'template 端 WorkflowStore 為 read-only；workflow 由 factory HMAC push 或 stage 3 後台 CRUD 寫入',
      );
    },

    async update(): Promise<void> {
      throw new Error('template 端 WorkflowStore 為 read-only（同 insert）');
    },

    async delete(): Promise<void> {
      throw new Error('template 端 WorkflowStore 為 read-only（同 insert）');
    },

    async findById(id: string): Promise<Workflow | undefined> {
      const res = await payload.find({
        collection: 'workflow-registry',
        where: {
          and: [{ workflowId: { equals: id } }, { activeVersion: { equals: true } }],
        },
        limit: 1,
        overrideAccess: true,
      });
      const doc = res.docs[0] as RegistryDoc | undefined;
      return doc ? toWorkflow(doc) : undefined;
    },

    async listByProject(projectId: string): Promise<Workflow[]> {
      const res = await payload.find({
        collection: 'workflow-registry',
        where: {
          and: [{ projectId: { equals: projectId } }, { activeVersion: { equals: true } }],
        },
        limit: 500,
        overrideAccess: true,
      });
      return (res.docs as unknown as RegistryDoc[]).map(toWorkflow);
    },
  };
}
