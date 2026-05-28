import { describe, expect, it } from 'vitest';

import {
  BLOG_PREFIX,
  COURSE_PREFIX,
  HOMEPAGE_PATHS,
  SHOP_PREFIX,
  cmsPagePaths,
  localizedPaths,
} from './route-paths.js';

describe('localizedPaths', () => {
  it('slug 為空 → 回 listing 頁（不含 slug 段）', () => {
    expect(localizedPaths('products', '')).toEqual(['/zh-TW/products', '/en/products']);
  });

  it('slug 有值 → 完整路徑 zh-TW + en', () => {
    expect(localizedPaths('blog', 'hello-world')).toEqual([
      '/zh-TW/blog/hello-world',
      '/en/blog/hello-world',
    ]);
  });

  it('prefix 常數對齊路徑', () => {
    expect(SHOP_PREFIX).toBe('products');
    expect(COURSE_PREFIX).toBe('courses');
    expect(BLOG_PREFIX).toBe('blog');
  });
});

describe('cmsPagePaths', () => {
  it('isHomepage=true → 回根路徑（不加 /pages/slug）', () => {
    expect(cmsPagePaths({ isHomepage: true, slug: 'home' })).toEqual(HOMEPAGE_PATHS);
  });

  it('isHomepage=false 有 slug → 根 + /pages/slug', () => {
    expect(cmsPagePaths({ isHomepage: false, slug: 'about' })).toEqual([
      ...HOMEPAGE_PATHS,
      '/zh-TW/pages/about',
      '/en/pages/about',
    ]);
  });

  it('isHomepage 未定義 + slug 空 → 只回根（沒 slug 無從產 /pages 路徑）', () => {
    expect(cmsPagePaths({ slug: '' })).toEqual(HOMEPAGE_PATHS);
  });

  it('doc=undefined → 只回根（fallback 安全）', () => {
    expect(cmsPagePaths(undefined)).toEqual(HOMEPAGE_PATHS);
  });
});
