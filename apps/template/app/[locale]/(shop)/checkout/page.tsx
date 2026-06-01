import { getPayload } from 'payload';

import { CheckoutForm } from './checkout-form';

import config from '@/payload.config';

/**
 * 結帳頁（goal-14 scaffolding MVP）。
 *
 * 範圍：單品直購（query string 帶 productId + quantity）；沒接購物車。
 *   /[locale]/checkout?productId=xxx&quantity=1
 *
 * 流程：拉 product → 顯示金額 + 表單 → 提交跳到藍新 hosted page → callback 進來改 Order
 * 狀態（/api/payments/newebpay/callback handler 處理）。
 *
 * Server Component 負責讀 Payload；Client Component 負責表單互動。
 *
 * 未設藍新 env → 表單仍會顯示但提交會 503（讓使用者看到「金流尚未啟用」訊息）。
 */
export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ productId?: string; quantity?: string }>;
}) {
  await params;
  const sp = await searchParams;
  const productId = sp.productId;
  const quantity = Number.parseInt(sp.quantity ?? '1', 10) || 1;

  if (!productId) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-[var(--radius-2xl)] bg-white p-10 shadow-sm ring-1 ring-black/10">
          <h1 className="text-2xl font-bold">結帳</h1>
          <p className="mt-4 text-sm opacity-70">
            缺 productId 參數。範例：
            <code className="ml-1 rounded bg-stone-100 px-1.5 py-0.5 text-xs">
              /checkout?productId=&lt;id&gt;&amp;quantity=1
            </code>
          </p>
        </div>
      </main>
    );
  }

  const payload = await getPayload({ config });
  const product = await payload.findByID({
    collection: 'products',
    id: productId,
    disableErrors: true,
  });

  if (!product) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-[var(--radius-2xl)] bg-white p-10 shadow-sm ring-1 ring-black/10">
          <h1 className="text-2xl font-bold">結帳</h1>
          <p className="mt-4 text-sm text-rose-700">查無商品 id={productId}</p>
        </div>
      </main>
    );
  }

  const productAny = product as unknown as Record<string, unknown>;
  const title = (productAny.title as string) ?? '商品';
  // products collection 目前是 stub 沒 price；後續 goal-03 補上 price 欄位
  const unitPriceRaw = productAny.price ?? productAny.unitPrice ?? 100;
  const unitPrice = typeof unitPriceRaw === 'number' ? unitPriceRaw : 100;
  const total = unitPrice * quantity;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">結帳</h1>

      <section className="mt-6 rounded-[var(--radius-2xl)] bg-white p-6 shadow-sm ring-1 ring-black/10">
        <h2 className="text-base font-semibold">訂購商品</h2>
        <dl className="mt-3 grid grid-cols-[80px_1fr] gap-y-2 text-sm">
          <dt className="opacity-60">商品</dt>
          <dd>{title}</dd>
          <dt className="opacity-60">單價</dt>
          <dd>NT$ {unitPrice.toLocaleString('zh-TW')}</dd>
          <dt className="opacity-60">數量</dt>
          <dd>{quantity}</dd>
          <dt className="opacity-60 font-semibold">總計</dt>
          <dd className="font-semibold">NT$ {total.toLocaleString('zh-TW')}</dd>
        </dl>
      </section>

      <CheckoutForm productId={productId} quantity={quantity} totalAmount={total} title={title} />
    </main>
  );
}
