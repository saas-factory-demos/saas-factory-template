# @saas-factory/payment-ecpay

綠界 ECPay AIO 全方位金流整合（信用卡 / ATM / 超商 / 條碼 / WebATM / ApplePay / GooglePay / TaiwanPay）。

## CheckMacValue 演算法

1. 將所有參數依 key 字母排序
2. 串成 `HashKey=...&K1=V1&K2=V2&HashIV=...`
3. ECPay 風格 URL encode（小寫 + `!*()` 映射）
4. 轉小寫
5. SHA256 hex → 大寫

## 使用

```ts
import { EcpayProvider } from '@saas-factory/payment-ecpay';

const provider = new EcpayProvider({
  merchantId: '2000132',          // 沙箱測試商店
  hashKey: 'pwFHCqoQZGmho4w6',
  hashIv: 'EkRm7iFT261dpevs',
  env: 'sandbox',
});

const charge = await provider.charge({
  orderId: 'O-001',
  tenantId: 't1',
  method: 'credit',
  amount: { amount: 990, currency: 'TWD' },
  idempotencyKey: 'O-001-charge',
  notifyUrl: 'https://yoursite.com/api/webhooks/ecpay',
  returnUrl: 'https://yoursite.com/checkout/done',
});
// charge.raw 即 form params，直接 POST 到 charge.redirectUrl
```

## 對應 ADR

- ADR-0011 §02-01：綠界為必備 provider
- ADR-0011 §02-09：webhook 驗簽
