# @saas-factory/marketing-referral

推薦好友 give & get 模組（與 `affiliate` 不同：referral 給的是優惠金，不是抽佣月結）。

## 功能

- 每客戶唯一推薦碼
- 雙邊獎勵（referrer + referee 都拿）
- 觸發點可選：`signup` 或 `first-purchase`
- 分享範本（LINE / Email / FB / 複製連結）
- 推薦人 dashboard summary
- 防作弊：自推自、同 referee 重複、同 IP / device 24h 內、單 referrer 上限

## 用法

```ts
import {
  ReferralService,
  InMemoryReferralCodeStore,
  InMemoryRedemptionStore,
  InMemoryRewardGrantStore,
} from '@saas-factory/marketing-referral';

const service = new ReferralService(
  new InMemoryReferralCodeStore(),
  new InMemoryRedemptionStore(),
  new InMemoryRewardGrantStore(),
  {
    trigger: 'first-purchase',
    referrerRewardMinor: 10000,
    refereeRewardMinor: 10000,
    maxRedemptionsPerReferrer: 10,
    duplicateWindowHours: 24,
  },
);

// 取分享範本
const code = await service.getOrCreateCode(tenantId, customerId);
const tpls = service.renderShareTemplates(code.code, 'https://shop.example.com/signup');

// 被推薦人首購時呼叫
const redemption = await service.redeem({
  tenantId,
  code: code.code,
  refereeCustomerId,
  refereeIp,
  refereeDeviceId,
  orderId,
  at: new Date(),
});
```

## 與其他模組關係

- `affiliate`：聯盟分潤是 % 抽佣 + 月結；`referral` 是固定額度雙邊立即發
- `coupons`：reward grant 可掛到優惠券系統當折抵金
- `automation-engine`：可訂閱 `referral.redeemed` 事件寄通知

## 指令

```bash
pnpm typecheck
pnpm test
pnpm lint
```
