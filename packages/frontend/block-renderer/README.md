# @saas-factory/frontend-block-renderer

goal-09i 後半段產出：BlockRenderer 套件。

把 `BlockInstance[]`（由 Wizard / Payload Pages collection 產出）依 `BLOCK_REGISTRY` 動態渲染為 React tree。

## 提供

- `<BlockRenderer blocks={...} motionLevel?={...} />`：核心 wrapper，依 `order` 排序、Suspense 包裹、未知 type 跳過。
- `<BlockErrorBoundary />`：單 block 渲染錯誤的隔離邊界，避免整頁崩潰。

## 設計鐵則

- 未知 `BlockInstance.type` → `console.warn` 後跳過，不 throw。
- 任一 block runtime throw → 由 `BlockErrorBoundary` 捕捉，其他 block 照常渲染。
- `visible === false` 的 block 自動隱藏。
- `motionLevel` 透過 `MotionLevelProvider` 注入子樹。

## 使用

```tsx
import { BlockRenderer } from '@saas-factory/frontend-block-renderer';

export default async function Page({ params }: { params: { slug: string } }) {
  const page = await loadPageBySlug('pages', params.slug);
  if (!page) return notFound();
  return <BlockRenderer blocks={page.blocks} motionLevel={3} />;
}
```

## 開發指令

```bash
pnpm typecheck
pnpm lint
pnpm test
```
