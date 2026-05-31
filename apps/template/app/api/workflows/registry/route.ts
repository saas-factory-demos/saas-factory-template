import config from '@payload-config';
import { getPayload } from 'payload';
import { z } from 'zod';

import { verifyWorkflowRuntimeSignature } from '@/lib/security/workflow-runtime-hmac';

/**
 * POST /api/workflows/registry
 *
 * Factory seed workflow 定義到 template 本地 registry（plan C：seed-only）。
 * 共用 WORKFLOW_RUNTIME_SECRET + SF-HMAC 簽章。
 *
 * 寫入策略：
 * 1. 接到推送 → 找 (workflowId, version) 一筆
 * 2. 若該 workflowId 任一筆已被客戶後台改過（customizedAt != null）→ skip
 *    回傳 `{ ok: true, action: 'skipped', reason: 'customized' }`
 *    這是 seed-only 保護：客戶心血不被 factory 自動同步刷掉
 * 3. 否則 upsert (workflowId, version) 一筆；若 activeVersion=true，同 workflowId
 *    其他版本 activeVersion 全部設 false
 *
 * 為何 context.fromFactoryPush：collection beforeChange hook 會根據此旗標
 * 跳過「自動設 customizedAt」邏輯，避免 factory push 被自己當成客戶編輯。
 *
 * body 結構：見 `registryPushSchema`。
 *
 * 回傳：`{ ok: true, id, action: 'created' | 'updated' | 'skipped' }`
 */

const registryPushSchema = z.object({
  workflowId: z.string().min(1),
  projectId: z.string().min(1),
  version: z.string().min(1),
  activeVersion: z.boolean().default(true),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'archived']),
  nodes: z.array(z.record(z.unknown())),
  edges: z.array(z.record(z.unknown())),
  pushedAt: z.string(),
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
  const parsed = registryPushSchema.safeParse(parsedBody);
  if (!parsed.success) {
    return Response.json(
      { ok: false, error: '格式不符', details: parsed.error.format() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const payload = await getPayload({ config });

  // 任一同 workflowId 筆已被客戶改過 → seed-only 保護，skip
  const customized = await payload.find({
    collection: 'workflow-registry',
    where: {
      and: [{ workflowId: { equals: data.workflowId } }, { customizedAt: { exists: true } }],
    },
    limit: 1,
    overrideAccess: true,
  });
  if (customized.docs.length > 0) {
    return Response.json({
      ok: true,
      action: 'skipped',
      reason: 'customized',
    });
  }

  // 找既有 (workflowId, version) 筆
  const existing = await payload.find({
    collection: 'workflow-registry',
    where: {
      and: [{ workflowId: { equals: data.workflowId } }, { version: { equals: data.version } }],
    },
    limit: 1,
    overrideAccess: true,
  });

  // factory push 走 context flag，collection beforeChange hook 會跳過 customizedAt 自動標記
  const reqContext = { fromFactoryPush: true };

  let id: string | number;
  let action: 'created' | 'updated';
  if (existing.docs.length > 0) {
    const doc = existing.docs[0];
    if (!doc) {
      return Response.json({ ok: false, error: 'unexpected empty doc' }, { status: 500 });
    }
    id = doc.id;
    action = 'updated';
    await payload.update({
      collection: 'workflow-registry',
      id: doc.id,
      overrideAccess: true,
      context: reqContext,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
    });
  } else {
    const created = await payload.create({
      collection: 'workflow-registry',
      overrideAccess: true,
      context: reqContext,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
    });
    id = created.id;
    action = 'created';
  }

  // 若本筆為 active，同 workflowId 其他版本翻成 false
  if (data.activeVersion) {
    await payload.update({
      collection: 'workflow-registry',
      where: {
        and: [
          { workflowId: { equals: data.workflowId } },
          { id: { not_equals: id } },
        ],
      },
      data: { activeVersion: false } as Record<string, unknown>,
      overrideAccess: true,
      context: reqContext,
    });
  }

  return Response.json({ ok: true, id, action });
}
