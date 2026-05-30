import { BlockRenderer } from '@saas-factory/frontend-block-renderer';
import { notFound } from 'next/navigation';

import { loadPageBySlug } from '@/lib/payload-pages';
import { projectConfig } from '@/project.config';

/**
 * LP 動態頁面：依 slug 從 Payload `pages` collection 撈出 blocks，餵給 BlockRenderer 渲染。
 *
 * goal-09i：改用 BlockRenderer 取代原本的硬寫 JSX；
 * Payload collection 接入待 goal-10+，目前 `loadPageBySlug` 為 stub 回 null → 走 notFound。
 */
export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!projectConfig.siteTypes.includes('lp')) {
    notFound();
  }
  const page = await loadPageBySlug('pages', slug, { locale });
  if (!page) {
    notFound();
  }
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <BlockRenderer blocks={page.blocks} />
    </main>
  );
}
