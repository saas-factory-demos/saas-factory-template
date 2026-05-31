# @saas-factory/crm

CRM 標籤 + 客戶分群 + 溝通歷史。對應 goal 01 §7。

## Collections

- `CustomerTags`：自訂標籤（manual / automated）
- `CustomerSegments`：分群定義（標籤 + lifecycle 組合）
- `CommunicationLog`：溝通歷史時間軸，append-only

## Segment 規則

```typescript
import { matchSegment } from '@saas-factory/crm';

matchSegment(
  { customerId: 'c1', tags: ['vip'], lifecycleStage: 'active' },
  { id: 's1', name: 'VIP active', requiredTags: ['vip'], lifecycleStages: ['active'] },
); // true
```

判斷規則：
1. tenantId 相同（若指定）
2. requiredTags 全部命中（AND）
3. anyTags 至少命中一個（OR，若指定）
4. excludedTags 不能命中任何
5. lifecycleStages 命中（若指定）

## 範圍

goal 01 階段只做資料結構與基本 segment 匹配。**自動標籤規則引擎 + 觸發 workflow 留給 goal 07 marketing-automation**（ADR-0010 §7）。

## 指令

```bash
pnpm typecheck
pnpm lint
pnpm test
```
