# @saas-factory/marketing-retargeting

再行銷與客戶生命週期（lifecycle）模組。負責：

- 累積 `CustomerActivity` 快照（首購、末購、訂單數、消費總額）
- 純函式 `classifyLifecycle` 依活動快照判定 `new / active / at-risk / dormant / lost / never-purchased`
- 偵測階段轉換並排程喚回任務（`win-back-30d` / `win-back-90d`）
- 商品瀏覽追蹤 → 72 小時未加購排 `viewed-not-added`
- 結帳成立 → 7 天後排 `purchased-cross-sell`

## Lifecycle 門檻

| 階段 | 規則 |
| --- | --- |
| `never-purchased` | 從未下單 |
| `new` | 1 張訂單，首購 30 天內 |
| `active` | 末購 90 天內 |
| `at-risk` | 末購 90-180 天 |
| `dormant` | 末購 180-365 天 |
| `lost` | 末購 365+ 天 |

## RetargetAction

| Action | 觸發 |
| --- | --- |
| `viewed-not-added` | 商品瀏覽 3 天後若未加購 |
| `added-not-checkout` | 由 `abandoned-cart` 模組接管 |
| `purchased-cross-sell` | 結帳 7 天後 |
| `win-back-30d` | 階段轉為 `at-risk` |
| `win-back-90d` | 階段轉為 `dormant` |

## 用法

```ts
import {
  RetargetingService,
  InMemoryCustomerActivityStore,
  InMemoryCustomerLifecycleStore,
  InMemoryProductViewStore,
  InMemoryRetargetTaskStore,
} from '@saas-factory/marketing-retargeting';

const service = new RetargetingService(
  new InMemoryCustomerActivityStore(),
  new InMemoryCustomerLifecycleStore(),
  new InMemoryProductViewStore(),
  new InMemoryRetargetTaskStore(),
);

// 訂單成立時
await service.recordPurchase({ tenantId, customerId, orderId, amountMinor, at });

// 商品瀏覽事件
await service.recordView({ tenantId, customerId, productId, at });

// 加購事件時取消 viewed-not-added
await service.cancelViewedTasks(tenantId, customerId, productId);

// 排程：每日跑一次
await service.evaluateLifecycleForTenant(tenantId);

// Worker：拉 due task 走外部通道
const due = await service.listDueTasks(tenantId);
// ...呼叫 email / line / sms sender
await service.markTaskSent(task.id);
```

## 與其他模組關係

- `abandoned-cart`：負責 `added-not-checkout`，本模組不重覆排程
- `automation-engine`：可消費 `RetargetTask` 作為 trigger 事件
- `segments`：透過 `listCustomersByStage` 取得分群名單

## 指令

```bash
pnpm typecheck
pnpm test
pnpm lint
```
