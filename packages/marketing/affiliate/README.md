# @saas-factory/marketing-affiliate

聯盟分潤模組。

## 功能

- 推薦人註冊與唯一推薦碼
- 訂單歸因（依推薦碼自動關聯）
- 兩層分潤（多層可開關 + 個別比例）
- Hold 期保護：退費期過後才轉 approved
- 退款自動 clawback
- 月結 payout：draft → requested → paid
- 自推自偵測（customerId === affiliate.customerId）
- 推薦人 dashboard stats

## 預設策略建議

- `level1Rate: 0.1`（10%）
- `level2Rate: 0.03`（3%，防傳銷法）
- `holdDays: 14`（多數金流退費期）

## 用法

```ts
import {
  AffiliateService,
  InMemoryAffiliateStore,
  InMemoryAttributionStore,
  InMemoryCommissionStore,
  InMemoryPayoutStore,
} from '@saas-factory/marketing-affiliate';

const service = new AffiliateService(
  new InMemoryAffiliateStore(),
  new InMemoryAttributionStore(),
  new InMemoryCommissionStore(),
  new InMemoryPayoutStore(),
  { level1Rate: 0.1, level2Rate: 0.03, multiLevelEnabled: true, holdDays: 14, selfReferralWindowMinutes: 60 },
);

// 推薦人註冊
const aff = await service.register({ tenantId, code: 'EPH123', customerId });

// 訂單成立時
await service.attributeOrder({ tenantId, orderId, code: 'EPH123', orderAmountMinor, customerId: buyerId, at: new Date() });

// 每日 cron 跑：把 hold 期過的轉 approved
await service.approveDueCommissions(tenantId);

// 退款時
await service.clawbackOrder(orderId);

// 月結
const payout = await service.createMonthlyPayout({ tenantId, affiliateId: aff.id, yearMonth: '2026-05' });
await service.requestPayout(payout.id);
await service.markPaid(payout.id);

// 推薦人 dashboard
const stats = await service.getStats(tenantId, aff.id);
```

## 與其他模組關係

- `referral`：give & get 雙向獎勵，與本模組分屬不同情境
- `automation-engine`：可訂閱 `commission.approved` 事件寄通知
- 上游金流：退款時必須 webhook 進來呼叫 `clawbackOrder`

## 指令

```bash
pnpm typecheck
pnpm test
pnpm lint
```
