# @saas-factory/marketing-banner

Banner 排程 + A/B 測試 + 點擊追蹤。

## 功能

- Slot 化（home-hero / home-secondary / category-top / checkout / 自訂）
- 起訖時間自動上下架（`tickStatus`）
- 日內時段（`dayWindow`，含跨午夜）
- A/B 測試：同 `experimentGroup` 內加權隨機
- 曝光 / 點擊 / CTR 統計

## 用法

```ts
import {
  BannerService,
  InMemoryBannerStore,
  InMemoryImpressionStore,
  InMemoryClickStore,
} from '@saas-factory/marketing-banner';

const service = new BannerService(
  new InMemoryBannerStore(),
  new InMemoryImpressionStore(),
  new InMemoryClickStore(),
);

// 後台：建立 A/B 兩版
await service.create({
  tenantId, slot: 'home-hero', title: '夏季促銷 A',
  imageUrl, linkUrl,
  startAt, endAt,
  dayWindow: { from: '09:00', to: '21:00' },
  experimentGroup: 'summer-2026',
  weight: 50,
});
await service.create({ /* version B, weight 50 */ });

// 每分鐘 cron
await service.tickStatus(tenantId);

// 前台：取要顯示的 banner
const banner = await service.resolveActive(tenantId, 'home-hero');

// 曝光 / 點擊追蹤
await service.recordImpression(banner.id, visitorId);
await service.recordClick(banner.id, visitorId);

// 統計
const s = await service.stats(banner.id);
```

## 指令

```bash
pnpm typecheck
pnpm test
pnpm lint
```
