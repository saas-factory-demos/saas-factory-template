# @saas-factory/shop-coupons

優惠券模組，建立在 discount-engine 之上，提供三種發放模式：

- `auto`：自動套用，不需輸入 code。
- `code`：單一 code，可被多次使用直到 `totalUsageLimit`。
- `bulk`：大量產生獨立 code，每組可一次性兌換或綁定指定使用者。

## 使用

```ts
import { CouponService, InMemoryCouponStore } from '@saas-factory/shop-coupons';

const service = new CouponService(new InMemoryCouponStore());
const result = await service.redeem('SAVE100', userId);
if (result.ok) {
  // 將 result.rule 丟給 DiscountEngine
}
```

## 大量產生

```ts
await service.generateBulk(coupon, { count: 1000, length: 10, prefix: 'NY2026' });
```

預設字元集已去除 0/O/1/I/L 等易混淆字元。

## Payload Collections

- `CouponsCollection`：優惠券主檔。
- `CouponCodesCollection`：bulk 模式下產生的 code 實例。

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
