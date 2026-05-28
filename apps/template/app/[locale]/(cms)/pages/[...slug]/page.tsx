import { BlockRenderer } from '@saas-factory/frontend-block-renderer';
import { notFound } from 'next/navigation';

import { loadPageBySlug } from '@/lib/payload-pages';
import { projectConfig } from '@/project.config';

/**
 * CMS 動態頁面：catch-all `/pages/[...slug]`。
 *
 * 從 Payload `pages` collection 撈頁面後 BlockRenderer 渲染。
 *
 * goal-09i：對齊 ADR 0013 BlockRenderer 與 Payload Blocks Field。
 * 之所以放 `/pages/` 子路徑：根 `/` 是 CMS 首頁、`/[slug]` 已被 LP 動態頁占用，
 * 把 CMS catch-all 收進 `/pages/...` 避免與 LP single-segment 衝突。
 * Payload `pages` collection 尚未建立，`loadPageBySlug` 為 stub。
 */
export default async function CmsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  if (!projectConfig.siteTypes.includes('cms')) {
    notFound();
  }
  const fullSlug = slug.join('/');
  const page = await loadPageBySlug('pages', fullSlug, { locale });
  if (!page) {
    notFound();
  }
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <BlockRenderer blocks={page.blocks} />
    </main>
  );
}
