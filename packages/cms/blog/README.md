# @saas-factory/cms-blog

部落格模組（文章 / 分類 / 標籤 / 多作者 / 系列 / RSS / 相關推薦 / 排程發布）。

## 功能

- Post + Author + Category + Tag + PostSeries collections
- Lexical rich text 內容（不在套件層綁定具體序列化格式）
- 自動萃取 plainText + 估算閱讀時間（中文 300 字/分、英文 250 字/分）
- 自動相關文章推薦：tag +2 / category +3 / series +5 / 30 天內 +1
- 手動指定相關文章可與自動推薦合併
- 排程發布（`schedulePost()` + cron 呼叫 `publishScheduled()`）
- RSS 2.0 feed（XML 含 atom:link self / content:encoded）
- 系列文按 `seriesOrder` 排序

## 使用

```ts
import { BlogService, InMemoryBlogStore } from '@saas-factory/cms-blog';

const service = new BlogService(new InMemoryBlogStore());

const author = await service.createAuthor({ tenantId: 't1', name: '王小明' });
const post = await service.createPost({
  tenantId: 't1',
  title: 'Hello',
  slug: 'hello',
  content: lexicalJson,
  authorIds: [author.id],
  status: 'published',
});

const rss = await service.generateRssFeed('t1', {
  title: '我的部落格',
  description: '描述',
  link: 'https://example.com',
  feedUrl: 'https://example.com/rss.xml',
});
```

## 留言

留言系統獨立在 `@saas-factory/cms-comments` 套件，Post 上的 `commentSource` 欄位指定該文章用 builtin / disqus / disabled。

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
