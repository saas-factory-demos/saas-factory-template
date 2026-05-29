# @saas-factory/marketing-line-marketing

LINE 行銷模組（broadcast / multicast / narrowcast、rich menu 排程、好友管理、月配額追蹤）。

## 功能

- `PushJob` 三種目標：broadcast / multicast / narrowcast（segment）
- 月配額預扣 + broadcast floor 防呆（避免燒光配額導致 transactional 訊息發不出去）
- LINE 好友 follow / unfollow / linkCustomer webhook 介面
- Rich menu CRUD + 時段排程（default 或單一 user）
- `LinePushHandler` + `LineSegmentResolver` 注入，避免硬綁 LINE SDK 與 segments 套件

## 用法

```ts
import {
  LineMarketingService,
  InMemoryPushJobStore,
  InMemoryQuotaStore,
  InMemoryFriendStore,
  InMemoryRichMenuStore,
  InMemoryRichMenuScheduleStore,
} from '@saas-factory/marketing-line-marketing';

const service = new LineMarketingService(
  new InMemoryPushJobStore(),
  new InMemoryQuotaStore(),
  new InMemoryFriendStore(),
  new InMemoryRichMenuStore(),
  new InMemoryRichMenuScheduleStore(),
  {
    pusher: { push: async () => ({ ok: true, sentCount: 10 }) },
    resolveSegment: async () => ['U1', 'U2'],
  },
  { monthlyLimit: 200_000, broadcastFloorRatio: 0.1 },
);

const job = await service.createJob({ tenantId, name, target, messages, scheduledAt });
await service.scheduleJob(job.id);

// cron
await service.dispatchDue(tenantId);
await service.tickRichMenuSchedules(tenantId);
```

## 指令

```bash
pnpm typecheck
pnpm test
pnpm lint
```
