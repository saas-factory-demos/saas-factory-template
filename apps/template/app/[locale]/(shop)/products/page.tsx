import { projectConfig } from '@/project.config';

/**
 * 電商商品列表佔位。
 */
export default function ProductsPage() {
  const enabled = projectConfig.siteTypes.includes('shop');
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-2xl bg-white p-10 shadow-sm ring-1 ring-black/10">
        <h1 className="text-3xl font-bold">商品列表</h1>
        <p className="mt-4 text-lg">
          {enabled ? '✅ 電商路由已就緒' : '⚠️ Shop 模組未啟用'}
        </p>
      </div>
    </main>
  );
}
