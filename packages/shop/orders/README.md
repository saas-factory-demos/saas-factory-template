# @saas-factory/shop-orders

訂單模組（goal 03 §7）。

Lock：ADR-0011 §03-07 v1。

## 狀態機

```
draft → pending-payment → paid → preparing → shipped → delivered → completed
                                       ↘ refund-requested → refunded
                                       ↘ cancelled
```

## DomainEvents
- `order.created`（draft → pending-payment 時 emit）
- `order.paid`
- `order.shipped`
- `order.completed`
- `order.cancelled`
- `order.refunded`

## 訂單編號格式
TW 慣例 `YYYYMMDD-NNNN`，例如 `20260515-0001`。
日流水號由 `order-sequences` collection 持久化。

## 拆單／合單
- 拆單：`parentOrderId` + `childOrderIds`
- 合單：同上反向

## 訂單項目快照
`OrderItem` 保留下單時的 title／unitPrice／optionValues／thumbnailUrl，
避免後續商品改名／改價影響歷史訂單。
