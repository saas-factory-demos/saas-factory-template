# @saas-factory/shop-member-tier

會員等級系統。

## 功能

- 等級條件：累計消費 / 訂單數 / 自訂條件（AND 邏輯）。
- 每級可設折扣百分比 / 點數倍率 / 免運門檻。
- 升降級自動判斷並 emit `member.tier-changed` 事件。
- 年度檢核（預設 365 天，可由 `reviewIntervalDays` 調整）。

## 使用

```ts
import { MemberTierService, InMemoryMemberTierStore } from '@saas-factory/shop-member-tier';

const service = new MemberTierService(store, { emit });
await service.evaluate({
  userId,
  tenantId,
  totalSpend: 60000,
  orderCount: 5,
});

const currentTier = await service.getCurrentTier(userId, tenantId);
```

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
