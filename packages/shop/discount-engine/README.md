# @saas-factory/shop-discount-engine

折扣引擎，支援 11 種規則類型與 13 種條件類型，含 stackable / priority / 使用次數限制。

## 使用

```ts
import { DiscountEngine } from '@saas-factory/shop-discount-engine';

const engine = new DiscountEngine();
const results = engine.apply(rules, context);
```

## 規則類型

- `percentage_off`：百分比折扣（含 maxAmount）。
- `fixed_off`：固定金額折扣。
- `free_shipping`：免運費。
- `buy_x_get_y`：買 X 送 Y。
- `tiered`：階梯滿額折。
- `bundle`：組合包折扣。
- `nth_item_off`：第 N 件折扣。
- `gift`：滿額贈品。
- `first_purchase`：首購折扣。
- `subscription_loyalty`：訂閱忠誠折扣。
- `custom`：自訂規則（需 plugin 擴充）。

## 條件類型

`min_amount` / `min_quantity` / `member_tier` / `first_purchase` / `birthday_month` / `specific_items` / `specific_categories` / `date_range` / `day_of_week` / `time_of_day` / `customer_tag` / `site_type` / `custom`。

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
