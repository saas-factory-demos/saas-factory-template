import { z } from 'zod';

import { verifyWorkflowRuntimeSignature } from '@/lib/security/workflow-runtime-hmac';
import { getRuntime } from '@/lib/workflow/runtime';

/**
 * POST /api/workflows/[id]/trigger
 *
 * 對外觸發點：拿到 workflow id（factory_workflows.id 對映本端 workflow-registry.workflowId）
 * 跑 scheduler.startRun()。
 *
 * 鑑權同 /api/workflows/registry：SF-HMAC + WORKFLOW_RUNTIME_SECRET。
 *
 * 為何 HMAC 不是 user session：trigger 預期被「客戶站內部其他系統 / form
 * webhook / factory 推送」打，沒 user context；HMAC 是現成且測過的對機協議。
 * 未來若要開「客戶後台手動觸發」，再另開一條 admin session 路由。
 *
 * body 結構：`{ triggerPayload?: Record<string, unknown> }`，會被注入 RunState.context.
 *
 * 回傳：scheduler.startRun 的結果 status (`running` | `suspended` | `completed` | `failed`)。
 */

const bodySchema = z.object({
  triggerPayload: z.record(z.unknown()).optional(),
});

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const secret = process.env.WORKFLOW_RUNTIME_SECRET ?? '';
  if (!secret) {
    return Response.json(
      { ok: false, error: 'WORKFLOW_RUNTIME_SECRET 未設定（fail-closed）' },
      { status: 503 },
    );
  }

  const auth = request.headers.get('authorization') ?? '';
  const match = /^SF-HMAC\s+([0-9a-f]+)$/i.exec(auth);
  if (!match) {
    return Response.json({ ok: false, error: '缺 SF-HMAC 簽章' }, { status: 401 });
  }
  const rawBody = await request.text();
  if (!verifyWorkflowRuntimeSignature(secret, rawBody, match[1] ?? '')) {
    return Response.json({ ok: false, error: 'HMAC 簽章不符' }, { status: 401 });
  }

  let parsedBody: unknown = {};
  if (rawBody.length > 0) {
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return Response.json({ ok: false, error: 'body 非 JSON' }, { status: 400 });
    }
  }
  const parsed = bodySchema.safeParse(parsedBody);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: '格式不符', details: parsed.error.format() },
      { status: 400 },
    );
  }

  const { id } = await ctx.params;
  const { scheduler } = await getRuntime();
  try {
    const result = await scheduler.startRun({
      workflowId: id,
      triggerPayload: parsed.data.triggerPayload ?? {},
    });
    return Response.json({ ok: true, status: result.status, resumeAt: result.resumeAt ?? null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('不存在')) {
      return Response.json({ ok: false, error: msg }, { status: 404 });
    }
    return Response.json({ ok: false, error: msg }, { status: 500 });
  }
}
