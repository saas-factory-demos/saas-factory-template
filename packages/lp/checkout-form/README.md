# @saas-factory/lp-checkout-form

LP 一頁式表單結帳（與電商購物車結帳分開），主打：

- 表單欄位越少越好（折疊式發票 + 折疊式優惠碼）
- 三段方案 + 推薦預選（UI 由前台元件處理）
- 信用卡 inline 走 Stripe / TapPay（卡片 token 由金流端保存）
- COD 必填收件地址
- OTP 行動電話驗證（防詐單，可選）
- 送出前 Order Bump 勾選加購
- 建單後傳 `OrderDraft` 給 `lp/upsell-funnel` 接力 One-Click Upsell

## 用法

```ts
import { LpCheckoutFormService, InMemoryOrderDraftStore, InMemoryOtpStore } from '@saas-factory/lp-checkout-form';

const svc = new LpCheckoutFormService(new InMemoryOrderDraftStore(), new InMemoryOtpStore(), {
  otpSender: async (phone, code) => sms.send(phone, `驗證碼：${code}`),
  discountResolver: async (code, ctx) => couponEngine.resolve(code, ctx),
});

// 1. 啟用 OTP 時，先呼叫
await svc.issueOtp(tenantId, phone);

// 2. 使用者送出表單
const draft = await svc.submit(config, payload);

// 3. 金流回呼
await svc.markStatus(draft.id, 'paid');

// 4. 進入 upsell-funnel
return upsellFunnel.start(draft);
```

## 注意

- `Stripe / TapPay` 卡片 token 不在本 package 處理，由結帳頁前端直接呼叫金流 SDK。
- `discountResolver` 為注入式：lp-checkout-form 不綁定優惠引擎，方便電商 / 課程共用 coupon 套件。
