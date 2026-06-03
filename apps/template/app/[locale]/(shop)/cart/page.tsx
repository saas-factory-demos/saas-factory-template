import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';

import { CartPageClient } from './cart-page-client';

/**
 * /cart 頁面（Phase 5 多商品擴充）。
 *
 * Server Component 殼 + Client 內容（cart 是會變的、CSR 比 SSR 簡單）。
 */
export const dynamic = 'force-dynamic';

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  void (await nextHeaders());
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="text-3xl font-bold tracking-tight">購物車</h1>
        <Link
          href={`/${locale}/products`}
          className="text-sm opacity-60 transition-all hover:opacity-100"
        >
          ← 繼續逛
        </Link>
      </header>

      <CartPageClient locale={locale} />
    </main>
  );
}
