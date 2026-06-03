import { BlockRenderer } from '@saas-factory/frontend-block-renderer';
import { notFound } from 'next/navigation';

import { loadPageBySlug } from '@/lib/payload-pages';
import { projectConfig } from '@/project.config';

/**
 * 部落格動態頁面：catch-all `/blog/[...slug]`。
 *
 * 對齊 ADR 0013；cms-blog PostsCollection（slug 'posts'）為部落格引擎，
 * BlockRenderer 直接消費 layout blocks。長文 rich text content 由其他 route render。
 */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  if (!projectConfig.siteTypes.includes('blog')) {
    notFound();
  }
  const fullSlug = slug.join('/');
  const page = await loadPageBySlug('posts', fullSlug, { locale });
  if (!page) {
    notFound();
  }
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <BlockRenderer blocks={page.blocks} />
    </main>
  );
}
