/**
 * 結帳取消跳轉頁（goal-14 scaffolding）。
 *
 * NewebPay 付款被使用者中止 / 失敗時跳到此頁。Order 狀態仍為 pending-payment（
 * callback 也可能根本沒進來）。讓使用者選擇重試或回首頁。
 */
import Link from 'next/link';

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string }>;
}) {
  const sp = await searchParams;
  const orderNumber = sp.orderNumber;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="rounded-[var(--radius-2xl)] bg-white p-10 shadow-sm ring-1 ring-black/10">
        <div className="text-4xl">✕</div>
        <h1 className="mt-4 text-2xl font-bold">付款未完成</h1>
        {orderNumber && (
          <p className="mt-2 text-sm opacity-70">
            訂單 <span className="font-mono">{orderNumber}</span> 已建立但尚未付款。
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="rounded-[var(--radius-md)] border border-black/10 bg-white px-4 py-2 text-sm shadow-sm transition-all duration-200 ease-out hover:shadow-md"
          >
            回首頁
          </Link>
        </div>
      </div>
    </main>
  );
}
