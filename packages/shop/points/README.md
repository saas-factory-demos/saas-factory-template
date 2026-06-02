# @saas-factory/shop-points

點數系統。

## 功能

- 賺點規則（消費 X 元 = Y 點）+ 倍率（與會員等級結合）。
- 用點規則（X 點 = Y 元）+ 單筆最高折抵金額限制。
- FIFO 到期：扣點時優先扣最早到期的批次。
- 過期 sweep（cron 定時呼叫 `sweepExpired`）。
- 點數異動歷史（earn / redeem / expire / manual-add / manual-deduct）。
- 後台手動加 / 扣（送禮 / 客訴補償），記錄 operatorUserId + reason。

## 使用

```ts
import { PointsService, InMemoryPointsStore } from '@saas-factory/shop-points';

const service = new PointsService(store, {
  emit,
  earnRule: { spendPerPoint: 100, expiryDays: 365 },
  redeemRule: { pointsPerCurrency: 1, maxRedeemAmount: 500 },
});

await service.earnFromOrder({ userId, tenantId, spendAmount: 5500, orderId });
const redeem = await service.redeem({ userId, tenantId, points: 100, orderId });
await service.sweepExpired(userId, tenantId);
```

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
