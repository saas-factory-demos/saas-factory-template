/**
 * 結帳成功跳轉頁（goal-14 scaffolding）。
 *
 * NewebPay 付款完成後跳到此頁；實際的 Order 狀態變更是 callback handler
 * 在 server 端寫的，這頁只負責「告訴使用者付完了」+ 顯示訂單編號。
 *
 * 訂單編號從 query 帶；如果 callback 還沒進來（時序差幾秒），DB 裡 status
 * 還是 pending-payment，這頁不阻擋，照顯示「處理中」訊息。
 */
import { getPayload } from 'payload';

import config from '@/payload.config';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string }>;
}) {
  const sp = await searchParams;
  const orderNumber = sp.orderNumber;

  let status: string | null = null;
  let total: number | null = null;
  if (orderNumber) {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: 'orders',
      where: { orderNumber: { equals: orderNumber } },
      limit: 1,
    });
    const order = res.docs[0];
    if (order) {
      const oAny = order as unknown as Record<string, unknown>;
      status = (oAny.status as string) ?? null;
      total = (oAny.total as number) ?? null;
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-[var(--radius-2xl)] bg-white p-10 shadow-sm ring-1 ring-black/10">
        <div className="text-4xl">✓</div>
        <h1 className="mt-4 text-2xl font-bold">付款已送出</h1>
        {orderNumber ? (
          <dl className="mt-6 grid grid-cols-[90px_1fr] gap-y-2 text-sm">
            <dt className="opacity-60">訂單編號</dt>
            <dd className="font-mono">{orderNumber}</dd>
            {total !== null && (
              <>
                <dt className="opacity-60">總金額</dt>
                <dd>NT$ {total.toLocaleString('zh-TW')}</dd>
              </>
            )}
            <dt className="opacity-60">狀態</dt>
            <dd>
              {status === 'paid' ? (
                <span className="text-emerald-700">✓ 已付款</span>
              ) : (
                <span className="opacity-70">處理中（藍新 callback 通常數秒內到達）</span>
              )}
            </dd>
          </dl>
        ) : (
          <p className="mt-4 text-sm opacity-70">缺 orderNumber 參數</p>
        )}
      </div>
    </main>
  );
}
