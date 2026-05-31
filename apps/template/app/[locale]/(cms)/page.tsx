import { BlockRenderer } from '@saas-factory/frontend-block-renderer';

import type { Locale } from '@/lib/locale';

import { loadHomePage } from '@/lib/payload-pages';
import { projectConfig } from '@/project.config';


/**
 * ISR：每 60 秒 revalidate fallback；後台改頁面會立刻打 revalidatePath
 * （見 lib/payload-revalidate.ts），所以實際更新延遲 ≈ 0。
 *
 * build time：若 Postgres 連不到 → loadHomePage throw → 在 catch 內回 null →
 * fallback placeholder，build 仍能完成。
 */
export const revalidate = 60;

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

/**
 * 首頁路由。
 *
 * 流程：
 * 1. 從 pages collection 撈 isHomepage=true 的 published 頁
 * 2. 有就用 BlockRenderer 渲染（後台可改首頁，不必改 code）
 * 3. 沒有 / Payload 連不到 → fallback 至靜態 placeholder
 */
export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const home = await loadHomePage(locale).catch((err: unknown) => {
    /* build time 連不到 DB / runtime Payload 暫時掛掉，都 fallback */
    console.warn('[home] loadHomePage failed, falling back to placeholder', err);
    return null;
  });

  if (home) {
    return <BlockRenderer blocks={home.blocks} />;
  }

  const enabled = projectConfig.siteTypes.includes('cms');
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-2xl bg-white p-10 shadow-sm ring-1 ring-black/10 transition-all duration-200 ease-out hover:shadow-lg">
        <h1 className="text-3xl font-bold">{projectConfig.meta.brandName}</h1>
        <p className="mt-4 text-lg">
          {enabled ? '✅ CMS 路由已就緒（尚未於後台設定首頁）' : '⚠️ CMS 模組未啟用'}
        </p>
        <p className="mt-2 text-sm opacity-70">
          siteTypes：{projectConfig.siteTypes.join('、')}
        </p>
      </div>
    </main>
  );
}
