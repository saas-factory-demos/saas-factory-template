import Link from 'next/link';
import { getPayload } from 'payload';

import config from '@/payload.config';

/**
 * 商品列表頁（goal-14 A6）。
 *
 * 範圍：只顯示 status='published' 的商品；單變體版，無分類 / 標籤過濾。
 * 後續 goal-03 補：分類 facet / 排序 / 分頁 / 搜尋。
 *
 * 圓角設計（CLAUDE.md 四）：卡片 14px、圖片 12px。
 */
export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: 'products',
    where: { status: { equals: 'published' } },
    limit: 50,
    sort: '-createdAt',
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">商品列表</h1>
        <p className="mt-2 text-sm opacity-60">共 {res.totalDocs} 件商品</p>
      </header>

      {res.docs.length === 0 ? (
        <div className="rounded-[var(--radius-2xl)] bg-white p-10 text-center shadow-sm ring-1 ring-black/10">
          <p className="text-sm opacity-70">
            目前沒有上架商品。請進
            <Link
              className="ml-1 underline"
              href={`/${locale}/admin/collections/products`}
            >
              後台
            </Link>
            建立第一個商品。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {res.docs.map((p) => {
            const pAny = p as unknown as Record<string, unknown>;
            const slug = pAny.slug as string;
            const title = (pAny.title as string) ?? '商品';
            const unitPrice = (pAny.unitPrice as number) ?? 0;
            const compareAt = (pAny.compareAtPrice as number) ?? 0;
            const currency = (pAny.currency as string) ?? 'TWD';
            const shortDesc = pAny.shortDescription as string | undefined;
            const gallery = (pAny.gallery as Array<{ image?: unknown }> | undefined) ?? [];
            const firstImg = gallery[0]?.image as
              | { url?: string; alt?: string }
              | undefined;
            return (
              <Link
                key={p.id}
                href={`/${locale}/products/${slug}`}
                className="group rounded-[var(--radius-lg)] bg-white p-4 shadow-sm ring-1 ring-black/10 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden rounded-[var(--radius-md)] bg-stone-100">
                  {firstImg?.url ? (
                    <img
                      src={firstImg.url}
                      alt={firstImg.alt ?? title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-3xl opacity-30">
                      {title.slice(0, 1)}
                    </div>
                  )}
                </div>
                <h2 className="mt-3 text-base font-semibold">{title}</h2>
                {shortDesc && (
                  <p className="mt-1 line-clamp-2 text-xs opacity-60">{shortDesc}</p>
                )}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-semibold">
                    {currency} {unitPrice.toLocaleString('zh-TW')}
                  </span>
                  {compareAt > unitPrice && (
                    <span className="text-xs line-through opacity-50">
                      {compareAt.toLocaleString('zh-TW')}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
