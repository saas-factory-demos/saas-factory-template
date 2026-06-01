# @saas-factory/shop-checkout

一頁式結帳協調器。負責把 cart / inventory / discount / coupon / shipping / tax / payment / orders 串成完整流程。

## 設計

- **介面化依賴**：CartReader / ShippingCalculator / TaxCalculator / PaymentInitiator / InventoryReserver / OrderNumberProvider / getRules 全部由 caller 注入，方便測試 + 換 provider（留接口給真實上線串接）。
- `quote()`：純試算，給結帳頁右側即時顯示折扣 / 運費 / 稅 / 總額。
- `submit()`：預扣庫存 → 建單 → 啟動金流，任一步失敗即拋例外。
- 折扣會依比例分攤到各 OrderItem.allocatedDiscount，方便退貨時知道每樣商品實付多少。

## 使用

```ts
import { CheckoutService } from '@saas-factory/shop-checkout';

const service = new CheckoutService({
  cart: cartReader,
  shipping: shippingCalc,
  tax: taxCalc,
  payment: paymentInitiator,
  inventory: inventoryReserver,
  getRules: async ({ tenantId, couponCode, userId }) => [...autoRules, ...redeemedRules],
  orderNumber: orderNumberProvider,
  orderId: () => generateUuid(),
}, { emit, currency: 'TWD' });

const quote = await service.quote(input);
const result = await service.submit(input);
```

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
