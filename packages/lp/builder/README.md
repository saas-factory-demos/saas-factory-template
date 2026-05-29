# @saas-factory/lp-builder

LP 一頁式銷售網站編輯器核心：page CRUD + block 拖拉 / 開關 / 複製 + 草稿 / 發布 / 排程。

## 資料模型

- `LpPage`：一支 LP，含 blocks 陣列、slug、SEO、status、scheduledPublishAt
- `LpBlock`：每個區塊有 `id`、`type`（hero / faq / checkout-form 等）、`enabled`、`props`

各 block type 的 `props` schema 由 `@saas-factory/lp-blocks` 套件定義 + Zod 驗證。

## 區塊操作

```ts
await svc.addBlock(pageId, { type: 'hero', enabled: true, props: { title: '...' } });
await svc.reorderBlocks(pageId, [id3, id1, id2]);     // 拖拉
await svc.toggleBlock(pageId, blockId);                // 開關
await svc.duplicateBlock(pageId, blockId);             // 複製
await svc.updateBlockProps(pageId, blockId, { title: 'New' });
```

## 發布

- `publish(pageId)`：立即發布
- `schedulePublish(pageId, at)`：排程
- `runScheduledPublish(tenantId)`：worker 定時掃描自動發布到期頁面
- `getPublishedPage(tenantId, slug)`：前台渲染用，自動過濾 `enabled=false` 的 block
