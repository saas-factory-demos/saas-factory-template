import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';
import { getPayload } from 'payload';

import { CheckoutForm } from './checkout-form';

import { quoteCheckoutFromCart } from '@/lib/cart/checkout-from-cart';
import config from '@/payload.config';

/**
 * 結帳頁（Phase 9 多商品擴充 — cart-based）。
 *
 * 範圍：從 cart cookie 拉 active cart → quoteCheckoutFromCart 顯示金額/折扣/總計。
 * 用戶按「前往付款」呼 POST /api/checkout（cart-id cookie 自動帶）。
 *
 * 向後相容：URL 帶 productId 是過去單品直購入口，現在改為「先加入 cart 再導 cart 頁」
 * 但本頁仍可直接 render（empty cart 提示）。
 */
export const dynamic = 'force-dynamic';

function readCookieFromHeaderList(cookies: Headers, key: string): string | null {
  const raw = cookies.get('cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === key) return rest.join('=');
  }
  return null;
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const h = await nextHeaders();
  const cartId = readCookieFromHeaderList(h, 'cart-id');

  if (!cartId) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-[var(--radius-2xl)] bg-white p-10 shadow-sm ring-1 ring-black/10">
          <h1 className="text-2xl font-bold">結帳</h1>
          <p className="mt-4 text-sm opacity-70">
            購物車尚未建立。先去
            <Link className="ml-1 underline" href={`/${locale}/products`}>
              商品列表
            </Link>
            選購商品吧。
          </p>
        </div>
      </main>
    );
  }

  const payload = await getPayload({ config });
  const cartRes = await payload.find({
    collection: 'carts',
    where: {
      and: [{ cartId: { equals: cartId } }, { status: { equals: 'active' } }],
    },
    limit: 1,
  });
  const cart = cartRes.docs[0];

  if (!cart) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-[var(--radius-2xl)] bg-white p-10 shadow-sm ring-1 ring-black/10">
          <h1 className="text-2xl font-bold">結帳</h1>
          <p className="mt-4 text-sm opacity-70">找不到使用中的購物車（可能已過期或結帳完成）。</p>
        </div>
      </main>
    );
  }

  const cartAny = cart as unknown as Record<string, unknown>;
  if (((cartAny.items as unknown[]) ?? []).length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-[var(--radius-2xl)] bg-white p-10 shadow-sm ring-1 ring-black/10">
          <h1 className="text-2xl font-bold">結帳</h1>
          <p className="mt-4 text-sm opacity-70">購物車是空的。</p>
          <Link
            href={`/${locale}/products`}
            className="mt-4 inline-block rounded-[var(--radius-md)] bg-[hsl(var(--color-primary-500))] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
          >
            去逛逛
          </Link>
        </div>
      </main>
    );
  }

  const quote = await quoteCheckoutFromCart(
    payload,
    cartAny as unknown as Parameters<typeof quoteCheckoutFromCart>[1],
  );
  const currency = (cartAny.currency as string) ?? 'TWD';

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">結帳</h1>
        <p className="mt-1 text-sm opacity-60">
          訂單共 {quote.orderItems.filter((it) => !it.parentBundleLineIdx).length} 項
        </p>
      </header>

      <section className="mb-6 rounded-[var(--radius-2xl)] bg-white p-6 shadow-sm ring-1 ring-black/10">
        <h2 className="text-base font-semibold">訂單摘要</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {quote.orderItems.map((it, i) => (
            <li
              key={`${String(it.productId)}-${it.variantSku}-${i}`}
              className={`flex items-center justify-between ${
                it.isBundleChild ? 'ml-4 opacity-60' : ''
              }`}
            >
              <span>
                {it.isBundleChild && '└ '}
                {it.title} × {it.quantity}
              </span>
              {!it.isBundleChild && (
                <span>
                  {currency} {(it.unitPrice * it.quantity).toLocaleString('zh-TW')}
                </span>
              )}
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-1.5 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="opacity-60">小計</dt>
            <dd>
              {currency} {quote.subtotal.toLocaleString('zh-TW')}
            </dd>
          </div>
          {quote.appliedDiscounts.map((d) => (
            <div key={d.ruleId} className="flex justify-between text-emerald-700">
              <dt className="text-xs">{d.ruleName}（{d.category}）</dt>
              <dd className="text-xs">
                − {currency} {d.amount.toLocaleString('zh-TW')}
              </dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-black/10 pt-2 font-semibold">
            <dt>應付金額</dt>
            <dd>
              {currency} {quote.total.toLocaleString('zh-TW')}
            </dd>
          </div>
        </dl>
      </section>

      <CheckoutForm totalAmount={quote.total} currency={currency} />
    </main>
  );
}
