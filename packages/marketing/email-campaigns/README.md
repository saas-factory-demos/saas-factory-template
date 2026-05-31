# @saas-factory/marketing-email-campaigns

Email 行銷活動模組（群發 / 排程 / 退訂 / 頻率上限 / 開信點擊統計）。

## 功能

- Campaign 物件 + 狀態機（draft → scheduled → sending → sent / cancelled）
- `dispatchDue` cron 抓 due 排程
- `EmailSenderHandler` + `SegmentResolver` 注入避免硬綁
- 退訂全域擋（合規必須）
- 頻率上限：同 email 在 N 小時內最多 M 封
- `recordProviderEvent` 收 webhook（delivered / opened / clicked / bounced / complained）
- stats：sent / open / click / bounce / unsubscribe 五率

## 用法

```ts
import {
  EmailCampaignService,
  InMemoryCampaignStore,
  InMemorySendStore,
  InMemoryEmailEventStore,
  InMemoryUnsubscribeStore,
} from '@saas-factory/marketing-email-campaigns';

const service = new EmailCampaignService(
  new InMemoryCampaignStore(),
  new InMemorySendStore(),
  new InMemoryEmailEventStore(),
  new InMemoryUnsubscribeStore(),
  {
    sender: { send: async (input) => { /* call Resend */ return { ok: true, providerMessageId: 'x' }; } },
    resolveSegment: async (tenantId, segmentId) => { /* 呼叫 segments 套件 */ return [] },
  },
  { windowHours: 24, maxEmailsInWindow: 2 },
);

const c = await service.create({ tenantId, name, subject, bodyHtml, bodyText, fromEmail, fromName, segmentId, scheduledAt });
await service.schedule(c.id);

// cron
await service.dispatchDue(tenantId);

// webhook
await service.recordProviderEvent(sendId, 'opened', new Date());

// 統計
const s = await service.stats(c.id);
```

## 指令

```bash
pnpm typecheck
pnpm test
pnpm lint
```
