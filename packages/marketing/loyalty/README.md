# @saas-factory/marketing-loyalty

忠誠度計畫（點數 ledger / 等級 tier / 兌換 reward / 過期 sweep）。

## 功能

- 點數 ledger 雙向（earn / redeem / clawback / expire / adjust）
- 等級 tier：earnMultiplier、earnRateOverride、threshold
- Reward 目錄 + 兌換流程（FIFO 消耗 earn）
- 兌換橋接 `issueReward`（產生 coupon code 或 gift card），失敗自動回補
- 月為單位的點數壽命 + `sweepExpired` cron
- `clawbackForRefund` 對應退款流程
- `recomputeTier` 依過去 12 個月 earn-order 推算

## 用法

```ts
import {
  LoyaltyService,
  InMemoryPointEntryStore,
  InMemoryCustomerTierStore,
  InMemoryRewardItemStore,
  InMemoryRedemptionStore,
  InMemoryProgramConfigStore,
} from '@saas-factory/marketing-loyalty';

const service = new LoyaltyService(
  new InMemoryPointEntryStore(),
  new InMemoryCustomerTierStore(),
  new InMemoryRewardItemStore(),
  new InMemoryRedemptionStore(),
  new InMemoryProgramConfigStore(),
  { issueReward: async () => ({ ok: true, issuedCode: 'CP-XYZ' }) },
);

await service.upsertProgram({
  tenantId,
  minorPerPoint: 100,
  pointLifetimeMonths: 12,
  tiers: [
    { code: 'bronze', name: '銅', thresholdMinor: 0, earnMultiplier: 1, benefits: [] },
    { code: 'silver', name: '銀', thresholdMinor: 5000000, earnMultiplier: 1.5, benefits: [] },
  ],
});

await service.earnFromOrder({ tenantId, customerId, orderId, orderTotalMinor });
const bal = await service.getBalance(tenantId, customerId);
const r = await service.createReward({ ... });
await service.redeem({ tenantId, customerId, rewardId: r.id });

// cron
await service.sweepExpired(tenantId);
```

## 指令

```bash
pnpm typecheck
pnpm test
pnpm lint
```
