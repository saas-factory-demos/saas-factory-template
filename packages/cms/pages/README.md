# @saas-factory/cms-pages

自訂頁面系統，layout 用 `@saas-factory/frontend-blocks` 的 BLOCK_REGISTRY + Zod schema 驗證。

## 功能

- 頁面樹（parentId 串接）+ sortOrder 排序
- URL slug 正規化（含中文保留）
- 多層級 path 解析（`/services/web-design`）
- 首頁唯一（isHomepage）
- 狀態：draft / published / archived
- 排程發布（scheduledAt + `publishScheduled()` cron）
- SEO 欄位（meta / OG / noindex / nofollow / canonical / keywords）
- Payload Pages collection 自動生成（吃 BLOCK_REGISTRY + zod-payload adapter）

## 使用

```ts
import {
  PageService,
  InMemoryPageStore,
  buildPagesCollection,
} from '@saas-factory/cms-pages';

const service = new PageService(new InMemoryPageStore());

// 後台 Pages collection（吃 blocks-library BLOCK_REGISTRY 自動生 Payload Block[]）
const PagesCollection = buildPagesCollection();
```

## Layout 驗證規則

`PageService.create` / `update` 會跑 `validateLayout`：

- 若 `block.type` 是 Tier 1 key（blocks-library 有實作）→ 用對應 Zod schema 驗 `block.config`
- 若 `block.type` 是 industry dotted slug（例：`profile.chef`）→ 跳過驗證，BlockRenderer 用 fallback 渲染
- 若 type 完全未知 → 跳過（不報錯，僅 fallback render 時警示）

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
