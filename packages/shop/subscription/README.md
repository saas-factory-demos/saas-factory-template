# @saas-factory/shop-subscription

訂閱補貨模組。

## 功能

- 頻率：weekly / biweekly / monthly / quarterly。
- 自助操作：暫停 / 跳過下次 / 變更頻率 / 變更地址 / 取消。
- 訂閱折扣（discountPercentage）。
- 出貨前提醒、卡片到期提醒。
- 失敗自動重試（隔天再試），達上限後自動取消。

## 設計

訂閱本身只管狀態 + 排程。實際出貨 / 扣款由 caller 注入 executor，例如：

```ts
await service.processDueRenewals('tenant-1', async (sub) => {
  // 1. 預扣庫存 (shop-inventory)
  // 2. 建立訂單 (shop-orders)
  // 3. 用 paymentToken 扣款 (payment-core)
  // 4. 回傳結果
});
```

failed → retry 隔天 → 連續達 `maxFailureRetries`（預設 3）即自動 cancelled。

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
