/**
 * 取消訂閱 endpoint（B2）。
 *
 * POST /api/subscriptions/:id/cancel  body: { reason? }
 *
 * 流程：
 * 1. 登入後台（或本人，目前先後台）
 * 2. 拉 Subscription（必須 status='active' 或 'paused'）
 * 3. 呼 provider.cancelSubscription（藍新 cancelSubscription）
 * 4. 改 status='cancelled' + cancelledAt + cancelReason
 *
 * 不會退已扣款（按比例退要走 refund flow 另算）。
 */
import { NewebPayProvider } from '@saas-factory/payment-newebpay';
import { headers as nextHeaders } from 'next/headers';
import { getPayload } from 'payload';

import config from '@/payload.config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CancelBody {
  reason?: string;
}

function newebpayFromEnv(): NewebPayProvider | null {
  const merchantId = process.env.NEWEBPAY_MERCHANT_ID;
  const hashKey = process.env.NEWEBPAY_HASH_KEY;
  const hashIv = process.env.NEWEBPAY_HASH_IV;
  const env = process.env.NEWEBPAY_ENV === 'production' ? 'production' : 'sandbox';
  if (!merchantId || !hashKey || !hashIv) return null;
  return new NewebPayProvider({ merchantId, hashKey, hashIv, env });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const payload = await getPayload({ config });

  const h = await nextHeaders();
  const auth = await payload.auth({ headers: h });
  if (!auth.user) {
    return Response.json({ error: '需要登入後台' }, { status: 401 });
  }

  let body: CancelBody;
  try {
    body = (await req.json().catch(() => ({}))) as CancelBody;
  } catch {
    body = {};
  }

  const sub = await payload.findByID({
    collection: 'subscriptions',
    id,
    disableErrors: true,
  });
  if (!sub) return Response.json({ error: 'subscription not found' }, { status: 404 });
  const subAny = sub as unknown as Record<string, unknown>;
  if (subAny.status !== 'active' && subAny.status !== 'paused' && subAny.status !== 'pending') {
    return Response.json(
      { error: `訂閱狀態為 ${subAny.status}，無法取消` },
      { status: 409 },
    );
  }

  /*
   * 目前 NewebPayProvider 沒實作 cancelSubscription（藍新 API 接窗，後續 milestone
   * 補）；本 endpoint 採取「本地標記取消」策略：
   *   - status='cancelled' + cancelledAt + cancelReason 馬上寫入
   *   - 之後若藍新仍續扣，callback handler 看到 subscription 已 cancelled 會略過
   *
   * 為何接受這個折衷：藍新訂閱本身的取消必須在商家後台手動操作，自動化代價大；
   * 標記後讓 admin 知道「要手動到藍新關掉」即可。回傳 warning 提示。
   */
  // suppress unused: provider build 留在這給後續 milestone 接 real cancel
  void newebpayFromEnv;

  await payload.update({
    collection: 'subscriptions',
    id,
    data: {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelReason: body.reason,
    },
    overrideAccess: true,
  });

  return Response.json({
    ok: true,
    warning:
      '已標記為 cancelled。請另到藍新商家後台確認停止扣款（provider cancelSubscription 尚未實作）。',
  });
}
