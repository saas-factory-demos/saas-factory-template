# @saas-factory/marketing-segments

客戶分群（動態 + predicate DSL + 推播通道過濾）。

## Predicate DSL

組合：`all` / `any` / `not`
Leaf op：`eq` / `neq` / `gt` / `gte` / `lt` / `lte` / `in` / `not-in` / `has-tag` / `within-days` / `older-than-days`

支援欄位：

- `tags`（陣列）
- `totalSpentMinor` / `totalOrders`（數字）
- `lifecycleStage`（`new` / `active` / `at-risk` / `dormant` / `lost` / `never-purchased`）
- `lastOrderAt` / `lastViewedAt` / `lastAddedToCartAt`（Date）
- `daysSinceLastOrder`（自動計算）
- `customAttrs.xxx`（自由）
- `consents.email` / `consents.line` / `consents.sms`

## 範例

```ts
import { SegmentService, InMemorySegmentStore, InMemoryCustomerProfileStore } from '@saas-factory/marketing-segments';

const service = new SegmentService(new InMemorySegmentStore(), new InMemoryCustomerProfileStore());

// VIP 30 天無訂單
const seg = await service.create({
  tenantId,
  name: 'VIP 30 天無訂單',
  predicate: {
    op: 'all',
    of: [
      { op: 'has-tag', field: 'tags', value: 'vip' },
      { op: 'older-than-days', field: 'lastOrderAt', value: 30 },
    ],
  },
});

// 動態抓名單
const { members } = await service.evaluate(seg.id);

// 推 Email（自動過濾 consents.email !== false）
const emailTargets = await service.listPushTargets(seg.id, 'email');
```

## 通道

`listPushTargets(segmentId, channel)` 過濾 `consents[channel] !== false`。
未設 consents 視為同意（預設啟用），明確設 `false` 才會被過濾掉，符合多數實務。

## 指令

```bash
pnpm typecheck
pnpm test
pnpm lint
```
