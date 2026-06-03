'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface Category {
  id: number | string;
  slug: string;
  title: string;
}

interface Tag {
  id: number | string;
  slug: string;
  title: string;
  type: 'style' | 'season' | 'campaign' | 'generic';
  colorHint?: string;
}

const TAG_TYPE_LABEL: Record<Tag['type'], string> = {
  style: '風格',
  season: '季節',
  campaign: '活動',
  generic: '其他',
};

/**
 * Facet Filter（Phase 7 多商品擴充）。
 *
 * URL search params 驅動：`?category=shirts&tag=spring,sale`
 * - SSR 友善（伺服器讀 searchParams 直接過濾 SQL）
 * - 可分享（複製連結別人看到一樣畫面）
 * - 上一頁可回（瀏覽器歷史正常運作）
 *
 * 多選：點 chip 切換進 / 出該值；URL 用 comma-join，例如多 tag。
 */
export function FacetFilter({
  categories,
  tags,
}: {
  categories: Category[];
  tags: Tag[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('category');
  const activeTags = (searchParams.get('tag') ?? '').split(',').filter(Boolean);

  function applyParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function toggleTag(slug: string) {
    const nextTags = activeTags.includes(slug)
      ? activeTags.filter((t) => t !== slug)
      : [...activeTags, slug];
    applyParam('tag', nextTags.join(',') || null);
  }

  // Tags 按 type 分組
  const tagsByType = new Map<Tag['type'], Tag[]>();
  for (const t of tags) {
    const list = tagsByType.get(t.type) ?? [];
    list.push(t);
    tagsByType.set(t.type, list);
  }

  return (
    <aside className="space-y-6">
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase opacity-60">分類</h3>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => applyParam('category', null)}
              className={`w-full rounded-[var(--radius-sm)] px-2 py-1 text-left text-sm transition-all ${
                !activeCategory ? 'bg-stone-100 font-semibold' : 'hover:bg-stone-50'
              }`}
            >
              全部
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => applyParam('category', c.slug)}
                className={`w-full rounded-[var(--radius-sm)] px-2 py-1 text-left text-sm transition-all ${
                  activeCategory === c.slug
                    ? 'bg-stone-100 font-semibold'
                    : 'hover:bg-stone-50'
                }`}
              >
                {c.title}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {Array.from(tagsByType.entries()).map(([type, list]) => (
        <section key={type}>
          <h3 className="mb-3 text-xs font-semibold uppercase opacity-60">
            {TAG_TYPE_LABEL[type]}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {list.map((t) => {
              const isActive = activeTags.includes(t.slug);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.slug)}
                  style={isActive && t.colorHint ? { backgroundColor: t.colorHint } : undefined}
                  className={`rounded-[var(--radius-full)] px-3 py-1 text-xs transition-all ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {t.title}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {(activeCategory || activeTags.length > 0) && (
        <button
          type="button"
          onClick={() => router.replace(pathname, { scroll: false })}
          className="text-xs text-rose-600 hover:text-rose-800"
        >
          清除所有篩選
        </button>
      )}
    </aside>
  );
}
