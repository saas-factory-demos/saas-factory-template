import { BlockRenderer } from '@saas-factory/frontend-block-renderer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';

import { VariantSelector } from '@/components/products/VariantSelector';
import { computeBundleAvailableStock } from '@/lib/cart/bundle-stock';
import { loadPageBySlug } from '@/lib/payload-pages';
import config from '@/payload.config';
import { projectConfig } from '@/project.config';

/**
 * 電商動態頁面：catch-all `/products/[...slug]`（goal-14 A6）。
 *
 * 兩段 lookup：
 * 1. 單 slug 段 → 先查 Products collection（單變體商品詳情）
 * 2. 沒中 / 多 slug 段 → 退 shop-pages 行銷頁
 *
 * 為何不分 `/products/[slug]` 與 `/products/[...slug]`：Next.js 不允許同層
 * 同時有單段與 catch-all（routing collision）。在 catch-all 內分流是慣用解。
 */
export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  if (!projectConfig.siteTypes.includes('shop')) {
    notFound();
  }

  // 單段 slug → 優先試 Products collection
  if (slug.length === 1) {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: 'products',
      where: {
        and: [
          { slug: { equals: slug[0] } },
          { status: { equals: 'published' } },
        ],
      },
      limit: 1,
    });
    const product = res.docs[0];
    if (product) {
      // Bundle 商品：算「能組多少組」並當 fake stock 傳給 renderProduct
      let bundleStock: number | undefined;
      const pAny = product as unknown as Record<string, unknown>;
      if (pAny.productType === 'bundle') {
        const bi = (pAny.bundleItems as Parameters<typeof computeBundleAvailableStock>[1] | undefined) ?? [];
        bundleStock = await computeBundleAvailableStock(payload, bi);
      }
      return renderProduct(product, locale, bundleStock);
    }
  }

  // 退 shop-pages 行銷頁
  const fullSlug = slug.join('/');
  const page = await loadPageBySlug('shop-pages', fullSlug, { locale });
  if (!page) notFound();
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <BlockRenderer blocks={page.blocks} />
    </main>
  );
}

function renderProduct(
  productDoc: unknown,
  locale: string,
  bundleStock?: number,
): React.JSX.Element {
  const p = productDoc as Record<string, unknown>;
  const isBundle = p.productType === 'bundle';
  const title = (p.title as string) ?? '商品';
  const slug = p.slug as string;
  const unitPrice = (p.unitPrice as number) ?? 0;
  const compareAt = (p.compareAtPrice as number) ?? 0;
  const currency = (p.currency as string) ?? 'TWD';
  const shortDesc = p.shortDescription as string | undefined;
  const longDesc = p.longDescription as unknown;
  const gallery = (p.gallery as Array<{ image?: unknown; alt?: string }> | undefined) ?? [];
  const optionDefs =
    (p.optionDefs as Array<{ name: string; values?: Array<{ value: string; label?: string }> }> | undefined) ?? [];
  const variants =
    (p.variants as Array<{
      sku: string;
      optionValues?: Record<string, string>;
      unitPrice: number;
      stock?: number;
      reservedStock?: number;
      image?: { url?: string; alt?: string } | null;
    }> | undefined) ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Link href={`/${locale}/products`} className="text-sm opacity-60 hover:opacity-100">
        ← 回商品列表
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        {/* gallery */}
        <div className="space-y-3">
          {gallery.length > 0 ? (
            gallery.map((g, i) => {
              const img = g.image as { url?: string; alt?: string } | undefined;
              if (!img?.url) return null;
              return (
                <div
                  key={i}
                  className="overflow-hidden rounded-[var(--radius-xl)] bg-stone-100"
                >
                  <img
                    src={img.url}
                    alt={img.alt ?? g.alt ?? title}
                    className="h-auto w-full object-cover"
                  />
                </div>
              );
            })
          ) : (
            <div className="aspect-square rounded-[var(--radius-xl)] bg-stone-100" />
          )}
        </div>

        {/* info */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {shortDesc && <p className="mt-3 text-sm opacity-70">{shortDesc}</p>}

          {compareAt > unitPrice && (
            <p className="mt-3 text-sm">
              <span className="text-base line-through opacity-50">
                {currency} {compareAt.toLocaleString('zh-TW')}
              </span>
              <span className="ml-2 rounded-[var(--radius-full)] bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
                省 {compareAt - unitPrice}
              </span>
            </p>
          )}

          {isBundle && bundleStock !== undefined && (
            <p className="mt-4 rounded-[var(--radius-md)] bg-amber-50 p-3 text-xs text-amber-900">
              組合商品：能組 {bundleStock} 組（取決於子商品庫存）
            </p>
          )}

          <div className="mt-6">
            <VariantSelector
              productId={p.id as number | string}
              optionDefs={optionDefs}
              variants={variants}
              productCurrency={currency}
              fallbackPrice={unitPrice}
            />
          </div>

          {/*
            longDescription：把 richtext lexical 物件序列化成純文字。
            完整 lexical renderer 等 goal-03 整合 @payloadcms/richtext-lexical 的 React renderer。
          */}
          {Boolean(longDesc) && (
            <div className="mt-8 border-t border-black/10 pt-6">
              <h2 className="text-base font-semibold">商品介紹</h2>
              <pre className="mt-3 whitespace-pre-wrap text-sm opacity-80">
                {extractLexicalText(longDesc)}
              </pre>
            </div>
          )}

          <p className="mt-6 font-mono text-[11px] opacity-30">slug: {slug}</p>
        </div>
      </div>
    </main>
  );
}

/**
 * 把 Lexical 的根節點扁平成純文字。
 *
 * 為何不用官方 React renderer：那會把整個 Lexical CSS / 元件樹拉進 client；
 * 詳情頁 MVP 不需要排版，純文字優於壞排版。goal-03 再升級。
 */
function extractLexicalText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const obj = node as Record<string, unknown>;
  if (typeof obj.text === 'string') return obj.text;
  const children = obj.children as unknown[] | undefined;
  if (!Array.isArray(children)) {
    if (obj.root) return extractLexicalText(obj.root);
    return '';
  }
  return children.map((c) => extractLexicalText(c)).join('\n');
}
