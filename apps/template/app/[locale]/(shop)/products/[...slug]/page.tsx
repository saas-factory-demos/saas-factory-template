import { BlockRenderer } from '@saas-factory/frontend-block-renderer';
import { notFound } from 'next/navigation';

import { loadPageBySlug } from '@/lib/payload-pages';
import { projectConfig } from '@/project.config';

/**
 * 電商動態頁面：catch-all `/products/[...slug]`。
 *
 * goal-09i：對齊 ADR 0013；Payload `shop-pages` collection 尚未建立，`loadPageBySlug` 為 stub。
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
  const fullSlug = slug.join('/');
  const page = await loadPageBySlug('shop-pages', fullSlug, { locale });
  if (!page) {
    notFound();
  }
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <BlockRenderer blocks={page.blocks} />
    </main>
  );
}
