# @saas-factory/cms-seo

SEO 工具集（OG image + JSON-LD + sitemap + robots + hreflang + 404 追蹤）。

## 功能

- **OG image layouts**：商品 / 文章 / 課程 / LP 四種樣板（純物件樹，丟給 `satori()` 渲染 SVG，再用 `resvg` 轉 PNG）
- **JSON-LD**：Organization / Article / Product / Course / BreadcrumbList / FAQPage / WebSite
- **sitemap.xml** 產生器（含 sitemap-index）
- **robots.txt** 產生器
- **hreflang** 多語標籤 + Next.js metadata helper
- **broken links** 追蹤（404 後台修補）

## 使用

```ts
import satori from 'satori';
import { productOgLayout, renderOgSvg } from '@saas-factory/cms-seo';

const tree = productOgLayout({ title: '商品 A', price: 'NT$1,200' });
const svg = await renderOgSvg(satori as never, tree, [
  { name: 'NotoSans', data: fontBuffer, weight: 400, style: 'normal' },
]);

// JSON-LD
import { productJsonLd } from '@saas-factory/cms-seo';
const ld = productJsonLd({
  name: '商品 A',
  price: 1200,
  priceCurrency: 'TWD',
  url: 'https://x.com/p/1',
});
// 放進頁面：<script type="application/ld+json">{JSON.stringify(ld)}</script>

// sitemap
import { generateSitemap } from '@saas-factory/cms-seo';
const xml = generateSitemap([
  { loc: 'https://x.com/', changefreq: 'daily', priority: 1 },
]);

// Next.js metadata
import { toNextMetadata } from '@saas-factory/cms-seo';
export const metadata = toNextMetadata(post.seo, { title: post.title });
```

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
