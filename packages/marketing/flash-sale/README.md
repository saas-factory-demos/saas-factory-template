# @saas-factory/marketing-flash-sale

快閃倒數活動。

## 功能

- 起訖時間 + 自動上下架（`tickStatus` cron）
- 套用範圍：全館 / 特定商品 / 特定分類
- 階段門檻折扣：達 N 人加購自動降到更深折扣
- 前台 `CountdownState` 含目前折扣 + 倒數時間 + 下一階段
- 加購事件即時更新 `addToCartCount`

## 用法

```ts
import {
  FlashSaleService,
  InMemoryFlashSaleStore,
} from '@saas-factory/marketing-flash-sale';

const service = new FlashSaleService(new InMemoryFlashSaleStore());

const sale = await service.create({
  tenantId,
  name: '週五晚 8 點全館 8 折',
  scope: { kind: 'all' },
  baseDiscount: { kind: 'percent', rate: 0.2 },
  tiers: [{ minCount: 50, discount: { kind: 'percent', rate: 0.3 } }],
  startAt: new Date('2026-05-15T12:00:00Z'),
  endAt: new Date('2026-05-15T14:00:00Z'),
});

// 每分鐘 cron
await service.tickStatus(tenantId);

// 商品加購事件
await service.incrementAddToCart(sale.id);

// 前台 banner
const state = await service.getCountdownState(sale.id);
```

## 指令

```bash
pnpm typecheck
pnpm test
pnpm lint
```
