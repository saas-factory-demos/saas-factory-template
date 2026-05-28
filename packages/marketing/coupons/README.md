# @saas-factory/marketing-coupons

進階優惠券模組（批量發券、個人專屬碼、自動發券、到期提醒、統計）。

> 折扣計算的整合層在 `shop-engine`/`automation-engine`，本模組負責碼的生成、驗證、生命週期。

## 功能

- `CouponBatch` 容器：折扣型態、起訖、最低門檻、總使用上限
- 批量產 N 張不重複一次性碼（去除易混淆字元 0/O、1/I）
- 個人專屬碼（自動發券 / 生日券 / 客服補償）
- 完整 `validate` 拒絕原因清單（7 種）
- `redeem` 寫 usedCount + redemption
- `statsForBatch`：發出 / 使用 / 折抵 / 帶來營收 / 轉換率
- `listCodesExpiringSoon` cron 用：找快到期未通知的個人碼

## 折扣型態

```ts
{ kind: 'percent', rate: 0.1 }
{ kind: 'fixed', amountMinor: 10000 }
{ kind: 'free-shipping' }
```

## 用法

```ts
import {
  CouponService,
  InMemoryCouponBatchStore,
  InMemoryCouponCodeStore,
  InMemoryCouponRedemptionStore,
} from '@saas-factory/marketing-coupons';

const service = new CouponService(
  new InMemoryCouponBatchStore(),
  new InMemoryCouponCodeStore(),
  new InMemoryCouponRedemptionStore(),
);

// 後台：建立活動 → 批量發 1000 張一次性碼
const batch = await service.createBatch({ tenantId, name: '5 月會員日', discount: { kind: 'percent', rate: 0.1 }, quantity: 1000, maxUsesPerCode: 1, validFrom, validUntil });
await service.generateCodes(batch.id, 1000);

// 自動發券：客戶生日當天
await service.issuePersonalCode({ batchId, customerId, source: 'auto-issue' });

// 結帳前驗證
const v = await service.validate({ tenantId, code, customerId, orderAmountMinor, shippingMinor, at: new Date() });
if (v.ok) /* 用 v.discountAmountMinor */;

// 訂單成立寫兌換
await service.redeem({ tenantId, code, customerId, orderId, orderAmountMinor, shippingMinor, at });

// Cron 每日跑：找快到期的個人碼寄提醒
const expiring = await service.listCodesExpiringSoon(tenantId, 7);
```

## 指令

```bash
pnpm typecheck
pnpm test
pnpm lint
```
