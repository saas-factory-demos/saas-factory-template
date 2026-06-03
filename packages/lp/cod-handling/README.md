# @saas-factory/lp-cod-handling

貨到付款（COD）訂單流程：狀態機 + 客服跟催 + 拒收黑名單。

## 為什麼需要

台灣電商 COD 拒收率高，需要：

1. 客服在出貨前電聯確認（pending-confirm）
2. 多次無人接自動取消，避免出貨後拒收
3. 累積拒收的客戶進黑名單，下次擋下單

## 狀態機

```
pending-confirm ─(confirm)─→ confirmed ─(markShipped)─→ shipped ─┬─(markDelivered)─→ delivered
       │                                                          └─(markRejected)──→ rejected
       │
       └─(cancel / 跟催 3 次無人接)─→ cancelled
```

## 用法

```ts
import {
  LpCodService,
  InMemoryCodOrderStore,
  InMemoryCodBlacklistStore,
} from '@saas-factory/lp-cod-handling';

const svc = new LpCodService(
  new InMemoryCodOrderStore(),
  new InMemoryCodBlacklistStore(),
  { maxRejectionsBeforeBlacklist: 2 },
);

const order = await svc.createOrder({
  tenantId,
  pageId,
  draftId,
  customer: { name: '王小明', phone: '0912345678' },
  channel: 'convenience-store',
  totalMinor: 99000,
});

await svc.attemptFollowUp(order.id);
await svc.confirm(order.id);
await svc.markShipped(order.id);
await svc.markDelivered(order.id);

const stats = await svc.rejectionStats(tenantId);
// { totalDeliveryAttempted, rejectedCount, rejectionRate }
```

## 黑名單規則

- 預設累積 2 次拒收進黑名單（可調 `maxRejectionsBeforeBlacklist`）
- 每次拒收都會寫入計數，但未達門檻前不阻擋下單（避免單次誤判）
- 達門檻後 `createOrder` 會直接 throw

## 拒收率計算

`rejectionRate = rejected / (delivered + rejected)`

shipped 中、pending-confirm、cancelled 都不算分母（避免污染指標）。
