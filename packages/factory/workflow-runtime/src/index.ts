/**
 * Workflow runtime 共享 pkg：scheduler + run store + dispatch。
 *
 * 與 @saas-factory/factory-workflows 的分工：
 * - factory-workflows：純資料模型 + executor（純函數 state machine）
 * - factory-workflow-runtime：把 executor 接到 DB / 時鐘 / 副作用
 *
 * 為何拆兩層：executor 純粹好測；runtime 才碰 IO，IO 部分允許多家 app（factory / template）
 * 各自掛自己的 DB 表 + email adapter。
 */

export { createDispatchAction } from './dispatch.js';
export type { DispatchDeps, EmailSender } from './dispatch.js';

export {
  createDrizzleWorkflowRunStore,
  InMemoryWorkflowRunStore,
  stateId,
} from './run-store.js';
export type { WorkflowRunStore } from './run-store.js';

export { defineWorkflowRunsTable } from './schema.js';
export type { WorkflowRunsTable } from './schema.js';

export { WorkflowScheduler } from './scheduler.js';
