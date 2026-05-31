# @saas-factory/shop-fraud-detection

防詐刷風險評分模組。

## 規則

| 規則 | 預設 | 預設分數 |
| --- | --- | --- |
| ip-velocity | 10 分鐘內同 IP > 3 筆 | 40 |
| address-diversity | 30 天內同帳號 > 3 個收件地址 | 25 |
| high-amount | 金額 >= 50,000 | 30 |
| high-rejection-rate | 拒收率 >= 30%（>= 3 單） | 35 |
| blacklist-*（email/phone/card-hash/ip） | 命中任一即觸發 | 100 |

## 動作門檻

- score >= `blockThreshold`（預設 70）→ `block`
- score >= `reviewThreshold`（預設 30）→ `review`
- 否則 `allow`
- 黑名單條目可指定 `action: 'block' | 'review'`，命中 `block` 強制 block

## 使用

```ts
import {
  FraudDetectionService,
  InMemoryFraudStore,
} from '@saas-factory/shop-fraud-detection';

const service = new FraudDetectionService(new InMemoryFraudStore());

// 結帳前檢查
const result = await service.check({
  tenantId: 't1',
  email: 'a@b.com',
  ip: '1.2.3.4',
  shippingAddress: '台北市...',
  amount: 12_000,
});
if (result.action === 'block') throw new Error('訂單被風控阻擋');
if (result.action === 'review') /* 標記為待審 */;

// 訂單成立後記錄
await service.recordOrder({ id: 'o-1', tenantId: 't1', email: 'a@b.com', amount: 12000, createdAt: new Date() });

// 拒收後更新風險標記
await service.markOrderRejected('t1', 'o-1', { email: 'a@b.com' });
```

## 安全注意

- 本套件不接收明碼信用卡號。傳入前請由 caller 端對卡號做 SHA-256 hash。
- 黑名單條目支援過期時間，可自動失效。

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
