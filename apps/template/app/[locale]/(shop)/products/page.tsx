import Link from 'next/link';
import { getPayload } from 'payload';

import { FacetFilter } from '@/components/products/FacetFilter';
import config from '@/payload.config';

/**
 * 商品列表頁（Phase 7 多商品擴充：facet filter + variant-aware）。
 *
 * 範圍：status='published' 商品；URL search params 驅動 facet（category / tag）。
 * 後續可加：排序（price asc/desc、最新、最熱）/ 分頁。
 *
 * 取消 force-dynamic（讓 facet URL 可被 ISR 收集），但 facet 變動透過 router.replace
 * 不會觸發 server re-render，需走 page-level revalidate 或 client-side filter（後者改寫量大）。
 * 目前折衷：dynamic = 'force-dynamic'（每次新 facet 都重 fetch）；高流量再優化。
 */
export const dynamic = 'force-dynamic';

interface SearchParams {
  category?: string;
  tag?: string;
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const payload = await getPayload({ config });

  // 拉 categories + tags 給 facet 顯示
  const [categoriesRes, tagsRes] = await Promise.all([
    payload.find({
      collection: 'product-categories',
      where: { visible: { equals: true } },
      sort: 'orderHint',
      limit: 100,
    }),
    payload.find({
      collection: 'product-tags',
      where: { visible: { equals: true } },
      limit: 200,
    }),
  ]);

  // 過濾條件：先按 slug 找 category / tags 的 id
  const categoryFilter = sp.category
    ? categoriesRes.docs.find((c) => (c as unknown as Record<string, unknown>).slug === sp.category)
    : null;
  const tagSlugs = (sp.tag ?? '').split(',').filter(Boolean);
  const filterTags = tagsRes.docs.filter((t) =>
    tagSlugs.includes((t as unknown as Record<string, unknown>).slug as string),
  );

  // 組商品 where（用 Payload Where type 但每組合條件 narrow type）
  const whereStatus = { status: { equals: 'published' } };
  const whereCategory = categoryFilter ? { categories: { in: [categoryFilter.id] } } : null;
  const whereTags = filterTags.length > 0 ? { tags: { in: filterTags.map((t) => t.id) } } : null;

  // Conditional spread 組 and 陣列
  const andClauses = [whereStatus, whereCategory, whereTags].filter(
    (c): c is NonNullable<typeof c> => c !== null,
  );
  const res = await payload.find({
    collection: 'products',
    where: { and: andClauses },
    limit: 100,
    sort: '-createdAt',
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">商品列表</h1>
        <p className="mt-2 text-sm opacity-60">共 {res.totalDocs} 件商品</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <FacetFilter
          categories={categoriesRes.docs.map((c) => {
            const r = c as unknown as Record<string, unknown>;
            return {
              id: r.id as number,
              slug: r.slug as string,
              title: r.title as string,
            };
          })}
          tags={tagsRes.docs.map((t) => {
            const r = t as unknown as Record<string, unknown>;
            return {
              id: r.id as number,
              slug: r.slug as string,
              title: r.title as string,
              type: r.type as 'style' | 'season' | 'campaign' | 'generic',
              colorHint: r.colorHint as string | undefined,
            };
          })}
        />

        {res.docs.length === 0 ? (
          <div className="rounded-[var(--radius-2xl)] bg-white p-10 text-center shadow-sm ring-1 ring-black/10">
            <p className="text-sm opacity-70">無符合條件的商品。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {res.docs.map((p) => {
              const pAny = p as unknown as Record<string, unknown>;
              const slug = pAny.slug as string;
              const title = (pAny.title as string) ?? '商品';
              const variants = (pAny.variants as Array<{ unitPrice: number }> | undefined) ?? [];
              const minPrice = variants.length > 0
                ? Math.min(...variants.map((v) => v.unitPrice))
                : (pAny.unitPrice as number) ?? 0;
              const currency = (pAny.currency as string) ?? 'TWD';
              const shortDesc = pAny.shortDescription as string | undefined;
              const gallery =
                (pAny.gallery as Array<{ image?: { url?: string; alt?: string } }> | undefined) ??
                [];
              const firstImg = gallery[0]?.image;
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
                      {currency} {minPrice.toLocaleString('zh-TW')}
                      {variants.length > 1 && <span className="ml-1 text-xs opacity-60">起</span>}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
