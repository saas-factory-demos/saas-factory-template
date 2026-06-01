import config from '@payload-config';
import { getPayload } from 'payload';

/**
 * /api/auth/passkey/[id]
 *
 * 對「自己擁有的」單一 passkey 做 PATCH（改 nickname）或 DELETE。
 *
 * 安全：兩個 method 都先用 doc.user === req.user.id 過濾；
 * 不依賴 collection access 的 `delete: ({ req }) => Boolean(req.user)`，
 * 那只擋未登入、不擋跨人。
 */

type Params = { params: Promise<{ id: string }> };

async function loadOwned(
  request: Request,
  id: string,
): Promise<
  | { ok: true; userId: string | number; payload: Awaited<ReturnType<typeof getPayload>>; doc: Record<string, unknown> }
  | { ok: false; status: number; error: string }
> {
  const payload = await getPayload({ config });
  const authResult = await payload.auth({ headers: request.headers });
  const user = authResult.user;
  if (!user) {
    return { ok: false, status: 401, error: 'unauthenticated' };
  }
  let doc: Record<string, unknown>;
  try {
    doc = (await payload.findByID({
      collection: 'user-credentials',
      id,
    })) as unknown as Record<string, unknown>;
  } catch {
    return { ok: false, status: 404, error: 'not found' };
  }
  const ownerRaw = doc.user;
  const ownerId =
    typeof ownerRaw === 'string' || typeof ownerRaw === 'number'
      ? ownerRaw
      : (ownerRaw as { id?: string | number } | null)?.id;
  if (String(ownerId) !== String(user.id)) {
    // 統一回 404 避免列舉
    return { ok: false, status: 404, error: 'not found' };
  }
  return { ok: true, userId: user.id, payload, doc };
}

export async function PATCH(request: Request, { params }: Params): Promise<Response> {
  const { id } = await params;
  const loaded = await loadOwned(request, id);
  if (!loaded.ok) {
    return Response.json({ ok: false, error: loaded.error }, { status: loaded.status });
  }

  let body: { nickname?: unknown };
  try {
    body = (await request.json()) as { nickname?: unknown };
  } catch {
    return Response.json({ ok: false, error: 'body 非 JSON' }, { status: 400 });
  }
  if (typeof body.nickname !== 'string' || body.nickname.length === 0) {
    return Response.json({ ok: false, error: 'nickname 不可為空' }, { status: 400 });
  }
  if (body.nickname.length > 80) {
    return Response.json({ ok: false, error: 'nickname 過長（≤80）' }, { status: 400 });
  }

  try {
    await loaded.payload.update({
      collection: 'user-credentials',
      id,
      data: { nickname: body.nickname },
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : 'update failed' },
      { status: 500 },
    );
  }
  return Response.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Params): Promise<Response> {
  const { id } = await params;
  const loaded = await loadOwned(request, id);
  if (!loaded.ok) {
    return Response.json({ ok: false, error: loaded.error }, { status: loaded.status });
  }

  try {
    await loaded.payload.delete({
      collection: 'user-credentials',
      id,
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : 'delete failed' },
      { status: 500 },
    );
  }
  return Response.json({ ok: true });
}
