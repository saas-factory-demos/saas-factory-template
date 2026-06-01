# @saas-factory/payment-newebpay

藍新金流 NewebPay MPG 整合（信用卡 / 分期 / ATM / 超商 / 條碼 / WebATM / LINE Pay / 街口 / 各家錢包）。

## 加解密

- AES-256-CBC + PKCS7（key=HashKey 32 字元、iv=HashIV 16 字元）
- SHA-256(`HashKey=...&TradeInfo&HashIV=...`) → 大寫 hex

## 使用

```ts
import { NewebPayProvider } from '@saas-factory/payment-newebpay';

const provider = new NewebPayProvider({
  merchantId: 'MS123',
  hashKey: process.env.NEWEBPAY_HASH_KEY!, // 32 chars
  hashIv: process.env.NEWEBPAY_HASH_IV!,   // 16 chars
  env: 'sandbox',
});

const charge = await provider.charge({
  orderId: 'O-001',
  tenantId: 't1',
  method: 'credit',
  amount: { amount: 990, currency: 'TWD' },
  idempotencyKey: 'O-001-charge',
  notifyUrl: 'https://yoursite.com/api/webhooks/newebpay',
  returnUrl: 'https://yoursite.com/checkout/done',
});
// 將 charge.raw（含 TradeInfo / TradeSha / MerchantID）丟到 form 自動 POST 到 charge.redirectUrl
```

## 驗收項

- AES 加解密：unit test 對稱還原通過
- TradeSha 驗證：constant-time 比對防 timing attack
- 退款（CreditCard/Close API）：CloseType=2 + Amt + fetch mock 測通
- 定期定額（PeriodAmt）：產生 PostData_ + TradeSha
- Webhook：簽章不過 → signatureValid=false，由 router 拒收 + 寫 audit

## 對應 ADR

- ADR-0011 §02-01：藍新為必備 provider
- ADR-0011 §02-09：webhook 驗簽失敗 → audit + 4xx
- ADR-0008 §HMAC：webhook 強制驗簽
