# @saas-factory/marketing-group-buy

團購模組（達門檻成團、未達退款）。

## 功能

- 建立 deal：minMembers / maxMembers / unitPriceMinor / deadlineAt
- 報名 join：到 minMembers 立即成團觸發 SuccessNotifier（寄 LINE 群連結）
- 取消 join：截止前可退（呼叫 RefundHandler）
- Cron `settleDue`：截止後未成團自動全退 + 標記 failed
- 同人重複報名擋

## 用法

```ts
import {
  GroupBuyService,
  InMemoryGroupBuyDealStore,
  InMemoryGroupBuyOrderStore,
} from '@saas-factory/marketing-group-buy';

const service = new GroupBuyService(
  new InMemoryGroupBuyDealStore(),
  new InMemoryGroupBuyOrderStore(),
  {
    refund: async ({ paymentOrderId, amountMinor }) => {
      // 呼叫金流退款 API
      return { ok: true };
    },
    notify: async ({ deal, members }) => {
      // 寄 LINE 群連結給所有成員
    },
  },
);

const deal = await service.createDeal({
  tenantId,
  productId,
  name: '5 人成團 8 折',
  minMembers: 5,
  unitPriceMinor: 80000,
  deadlineAt: new Date('2026-05-20T23:59:00Z'),
  lineGroupUrl: 'https://line.me/ti/g2/abc',
});

// 客戶報名（金流已過帳）
await service.join({ dealId: deal.id, customerId, paymentOrderId, at: new Date() });

// 每 5 分鐘 cron
await service.settleDue(tenantId);
```

## 指令

```bash
pnpm typecheck
pnpm test
pnpm lint
```
