import config from '@payload-config';
import {
  WorkflowScheduler,
  createDispatchAction,
  createDrizzleWorkflowRunStore,
  type EmailSender,
} from '@saas-factory/factory-workflow-runtime';
import { sql } from 'drizzle-orm';
import { getPayload } from 'payload';


import { createPayloadWorkflowStore } from './payload-workflow-store';

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { templateWorkflowRuns } from '@/lib/db/workflow-schema';

/**
 * Template 端 workflow runtime singleton。
 *
 * 設計取向：
 * - lazy init：第一次呼叫才 getPayload + 開 drizzle handle + 確保 runs table 存在
 * - runs 存 template_workflow_runs（drizzle 自管表，跟 Payload 自管 table 區隔）
 * - workflow 定義來源走 Payload Local API 讀 workflow-registry（activeVersion=true）
 * - dispatchAction 用 Resend（如有 RESEND_API_KEY），否則 stub ok:true
 *
 * 為何 ensureTable 內建：template 出貨給客戶站時 Payload migration system 不會
 * 自動建非 collection 表；本 runtime 第一次跑前自己 idempotent CREATE TABLE IF NOT EXISTS。
 * 不是長久方案（stage 4 統一 migration），但避免「客戶站第一次跑就炸」。
 */

interface Runtime {
  scheduler: WorkflowScheduler;
}

let cached: Runtime | undefined;
let tableEnsured = false;

async function ensureRunsTable(db: NodePgDatabase<Record<string, unknown>>): Promise<void> {
  if (tableEnsured) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS template_workflow_runs (
      id text PRIMARY KEY,
      workflow_id text NOT NULL,
      status text NOT NULL,
      state jsonb NOT NULL,
      resume_at timestamp with time zone,
      started_at timestamp with time zone NOT NULL DEFAULT now(),
      ended_at timestamp with time zone
    );
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS template_workflow_runs_resume_idx
      ON template_workflow_runs (status, resume_at);
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS template_workflow_runs_workflow_idx
      ON template_workflow_runs (workflow_id);
  `);
  tableEnsured = true;
}

/**
 * 最小 EmailSender adapter：呼 Resend HTTP API；無 API key 直接 ok（不打網路）。
 *
 * 為何不抽到獨立 pkg：template 已自有 RESEND_API_KEY 環境變數，且本層只給
 * workflow dispatchAction 用，hoisting 沒明顯收益。如未來 form notify / receipt
 * email 也走 Resend 再抽。
 */
function createTemplateEmailSender(): EmailSender {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WORKFLOW_NOTIFY_FROM ?? 'onboarding@resend.dev';
  if (!apiKey) {
    return {
      async send() {
        return { ok: true as const };
      },
    };
  }
  return {
    async send(input) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            from,
            to: input.to,
            subject: input.subject,
            html: input.html,
            text: input.text,
          }),
        });
        if (!res.ok) {
          return { ok: false as const, error: `Resend ${res.status} ${res.statusText}` };
        }
        return { ok: true as const };
      } catch (err) {
        return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
      }
    },
  };
}

export async function getRuntime(): Promise<Runtime> {
  if (cached) return cached;
  const payload = await getPayload({ config });
  // Payload postgres adapter 內含 drizzle instance；型別未在 public surface 暴露，
  // 用 unknown cast 取出。如未來 Payload 升版搬位置，此處要跟著改。
  const db = (payload.db as unknown as { drizzle: NodePgDatabase<Record<string, unknown>> })
    .drizzle;

  await ensureRunsTable(db);

  const workflows = createPayloadWorkflowStore(payload);
  const runs = createDrizzleWorkflowRunStore(db, templateWorkflowRuns);
  const dispatch = createDispatchAction({
    email: createTemplateEmailSender(),
    adminEmail: process.env.WORKFLOW_ADMIN_EMAIL,
  });
  const scheduler = new WorkflowScheduler(workflows, runs, dispatch);

  cached = { scheduler };
  return cached;
}

/** 測試 hook：清掉 singleton，下次 getRuntime() 會重新初始化。 */
export function _resetRuntimeForTest(): void {
  cached = undefined;
  tableEnsured = false;
}
