import { getRuntime } from '@/lib/workflow/runtime';

/**
 * GET /api/cron/workflow-tick
 *
 * Cron 入口：呼 scheduler.tick() 推進到期 suspended runs。
 *
 * 為何 GET：Vercel cron + GitHub Actions schedule 都打 GET 最方便。
 *
 * 鑑權兩條：
 * 1. Vercel cron 內部呼叫帶 Authorization: Bearer <CRON_SECRET>（CRON_SECRET 環境變數）
 * 2. 外部 cron（cron-job.org / Upstash QStash）也走同套 Bearer
 *
 * 為何 fail-closed：cron 入口可被外部打，沒鑑權會被人 DoS / 跑無謂排程。
 * 預設拒絕，CRON_SECRET 未設則 503 不啟用。
 */
export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET ?? '';
  if (!secret) {
    return Response.json(
      { ok: false, error: 'CRON_SECRET 未設定（fail-closed）' },
      { status: 503 },
    );
  }

  const auth = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  if (!match || match[1] !== secret) {
    return Response.json({ ok: false, error: 'cron 鑑權失敗' }, { status: 401 });
  }

  const { scheduler } = await getRuntime();
  const result = await scheduler.tick({ now: new Date() });
  return Response.json({ ok: true, ...result });
}
