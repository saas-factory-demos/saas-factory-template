import { projectConfig } from '@/project.config';

/**
 * 部落格列表佔位。
 */
export default function BlogPage() {
  const enabled = projectConfig.siteTypes.includes('blog');
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="rounded-2xl bg-white p-10 shadow-sm ring-1 ring-black/10">
        <h1 className="text-3xl font-bold">部落格</h1>
        <p className="mt-4 text-lg">
          {enabled ? '✅ 部落格路由已就緒' : '⚠️ Blog 模組未啟用'}
        </p>
      </div>
    </main>
  );
}
