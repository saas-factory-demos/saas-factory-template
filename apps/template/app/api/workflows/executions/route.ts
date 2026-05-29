import config from '@payload-config';
import { getPayload } from 'payload';
import { z } from 'zod';

import { verifyWorkflowRuntimeSignature } from '@/lib/security/workflow-runtime-hmac';

/**
 * POST /api/workflows/executions
 *
 * Workflow runtime 寫入端點。被 template 內部執行引擎呼叫（未來 PR）或 factory 端
 * 跨 app 通報用。共用 HMAC 簽章（`WORKFLOW_RUNTIME_SECRET`）避免外部濫用。
 *
 * 為何不走 Payload session：runtime 不是使用者操作，沒有 session；
 * factory 端跨 app 寫入也沒有 template 的 user。HMAC 是純 server-to-server 認證。
 *
 * 簽章協議：`Authorization: SF-HMAC <hex(sha256(secret + ":" + rawBody))>`
 *
 * 為何不用 Bearer：跟其他 user-token 區隔，避免混淆。
 *
 * body 結構：見 `executionInsertSchema`。
 */

const executionInsertSchema = z.object({
  workflowId: z.string().min(1),
  projectId: z.string().min(1),
  workflowVersion: z.string().optional(),
  status: z.enum(['queued', 'running', 'completed', 'failed', 'cancelled']),
  triggerKind: z
    .enum([
      'signup',
      'tag-added',
      'tag-removed',
      'page-viewed',
      'form-submitted',
      'order-placed',
      'manual',
    ])
    .optional(),
  context: z.record(z.unknown()).optional(),
  nodeStates: z.array(z.record(z.unknown())).optional(),
  currentNodeId: z.string().optional(),
  error: z.record(z.unknown()).optional(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  durationMs: z.number().int().nonnegative().optional(),
});

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.WORKFLOW_RUNTIME_SECRET ?? '';
  if (!secret) {
    return Response.json(
      { ok: false, error: 'WORKFLOW_RUNTIME_SECRET 未設定（fail-closed）' },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get('authorization') ?? '';
  const match = /^SF-HMAC\s+([0-9a-f]+)$/i.exec(authHeader);
  if (!match) {
    return Response.json({ ok: false, error: '缺 SF-HMAC 簽章' }, { status: 401 });
  }
  const providedSig = match[1] ?? '';

  const rawBody = await request.text();
  if (!verifyWorkflowRuntimeSignature(secret, rawBody, providedSig)) {
    return Response.json({ ok: false, error: 'HMAC 簽章不符' }, { status: 401 });
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return Response.json({ ok: false, error: 'body 非 JSON' }, { status: 400 });
  }
  const parsed = executionInsertSchema.safeParse(parsedBody);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: '格式不符', details: parsed.error.format() },
      { status: 400 },
    );
  }

  const payload = await getPayload({ config });
  try {
    const created = await payload.create({
      collection: 'workflow-executions',
      // 繞 access control（這條路徑已用 HMAC 驗章）
      overrideAccess: true,
      // 型別 cast：執行階段 zod 已驗章，但 Payload 生成型別比 zod schema 嚴格
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: parsed.data as any,
    });
    return Response.json({ ok: true, id: created.id });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : 'create failed' },
      { status: 500 },
    );
  }
}
