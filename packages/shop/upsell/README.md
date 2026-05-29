# @saas-factory/shop-upsell

Upsell / Cross-Sell 推薦模組。

## 位置（placement）

- `order-bump`：結帳送出前最後一刻彈窗 / 內嵌。
- `oto`：訂單完成頁的 One-Click Upsell funnel（不需重輸卡號，串 payment-core 的 saved-card token）。
- `cross-sell-pdp`：商品頁。
- `cross-sell-cart`：購物車。
- `cross-sell-checkout`：結帳頁底部。

## 觸發條件

- `has_variant` / `has_category`：購物車含特定 variant / category 才顯示。
- `min_amount`：訂單滿額才顯示。

## 統計

互動分為 shown / accepted / declined，由前端在各時點呼叫 `record*` API 紀錄。後台撈 `getStats(offerId)` 取得轉換率。

## 使用

```ts
import { UpsellService, InMemoryOfferStore } from '@saas-factory/shop-upsell';

const service = new UpsellService(store);
const offer = await service.pickOffer('order-bump', context);
await service.recordShown({ tenantId, offerId, userId });
```

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
