/**
 * Workflow runs 表的共用 schema 定義。
 *
 * 為何用 builder function：factory 與 template 各自有自己的 DB / 表名（避免 namespace 衝撞），
 * 但欄位形狀必須一致，否則 DrizzleWorkflowRunStore 寫進去的 row 在另一邊讀不出來。
 *
 * 用法：
 * ```ts
 * import { defineWorkflowRunsTable } from '@saas-factory/factory-workflow-runtime';
 * export const factoryWorkflowRuns = defineWorkflowRunsTable('factory_workflow_runs');
 * ```
 *
 * Migration SQL 必須跟欄位定義保持同步 — 由各 app 自己產 drizzle migration。
 */

import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export function defineWorkflowRunsTable(tableName: string) {
  return pgTable(tableName, {
    id: text('id').primaryKey(),
    workflowId: text('workflow_id').notNull(),
    status: text('status').notNull(),
    state: jsonb('state').notNull(),
    resumeAt: timestamp('resume_at', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
  });
}

export type WorkflowRunsTable = ReturnType<typeof defineWorkflowRunsTable>;
