# @saas-factory/cms-forms

拖拉表單系統（欄位 + 條件邏輯 + 反垃圾 + 多動作 + CSV 匯出）。

## 功能

- 11 種欄位：text / textarea / email / phone / number / select / radio / checkbox / date / file / consent
- 條件邏輯：依其他欄位的值決定顯示或隱藏（equals / not-equals / in / not-in / truthy / falsy；any / all 組合）
- 提交流程：honeypot → captcha → validate（隱藏欄位跳過）→ 寫入 → 跑 actions
- 4 種動作：notify-admin / auto-reply / webhook / marketing-trigger（goal-07 整合）
- 樣板替換：`{{fieldKey}}` 取值
- CSV 匯出（自動跳過 spam 列）

## 使用

```ts
import { FormService, InMemoryFormStore } from '@saas-factory/cms-forms';

const service = new FormService(new InMemoryFormStore(), {
  emailSender: async ({ to, subject, html }) => {
    await resend.emails.send({ from: 'no-reply@x.com', to, subject, html });
  },
  webhookSender: async ({ url, method, headers, body }) => {
    await fetch(url, { method, headers, body: JSON.stringify(body) });
  },
  verifyCaptcha: async (token) => {
    // 接 reCAPTCHA / hCaptcha
    return true;
  },
});

const form = await service.upsertForm({
  tenantId: 't1',
  name: '聯絡我們',
  slug: 'contact',
  fields: [
    { key: 'name', type: 'text', label: '姓名', required: true },
    { key: 'email', type: 'email', label: 'Email', required: true },
    {
      key: 'isCompany',
      type: 'checkbox',
      label: '我是企業客戶',
    },
    {
      key: 'companyName',
      type: 'text',
      label: '公司名稱',
      required: true,
      conditional: {
        action: 'show',
        match: 'all',
        rules: [{ fieldKey: 'isCompany', operator: 'truthy' }],
      },
    },
  ],
  actions: [
    { type: 'notify-admin', to: ['sales@x.com'], subject: '新諮詢：{{name}}' },
    { type: 'auto-reply', replyToFieldKey: 'email', subject: '感謝您' },
    { type: 'webhook', url: 'https://crm.example.com/leads' },
  ],
});

await service.submit({
  tenantId: 't1',
  formId: form.id,
  values: { name: '小明', email: 'a@b.com', isCompany: false },
});

const csv = await service.exportCsv('t1', form.id);
```

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
