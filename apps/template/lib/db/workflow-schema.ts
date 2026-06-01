import { defineWorkflowRunsTable } from '@saas-factory/factory-workflow-runtime/schema';

/**
 * template_workflow_runs：workflow 執行狀態（suspended 喚醒用）。
 *
 * 為何不走 Payload collection：
 * - Payload Local API 對「按 resumeAt 範圍 + status 索引掃描」沒原生支援，要 raw query
 * - 此表是 runtime 內部狀態，後台不需 CRUD UI（只需 read-only 紀錄頁，可另外做投影）
 * - 走 drizzle 直接管表，配合 createDrizzleWorkflowRunStore 用法跟 factory 端一致
 *
 * 表名 prefix `template_`：跟 Payload 自管 table 區隔，跟 factory 端 `factory_` 對稱。
 */
export const templateWorkflowRuns = defineWorkflowRunsTable('template_workflow_runs');
