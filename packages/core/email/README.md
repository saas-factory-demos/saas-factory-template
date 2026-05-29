# @saas-factory/email

Resend 寄信 + 模板渲染抽象。對應 goal 01 §2。

## 用法

```typescript
import {
  SimpleTemplateRenderer,
  createEmailServiceFromEnv,
} from '@saas-factory/email';

const renderer = new SimpleTemplateRenderer();
renderer.registerTemplate('welcome', '<h1>Hi {{name}}</h1>');

const service = createEmailServiceFromEnv(process.env, renderer);

const html = await service.renderTemplate('welcome', { name: 'Ephraim' });
await service.send({
  to: 'a@example.com',
  subject: 'Welcome',
  html,
});
```

## 模板系統

真正 React Email 模板由 apps 端實作並透過自訂 `TemplateRenderer` 注入；本 package 提供 `SimpleTemplateRenderer` 作為 fallback / 測試用。

內建模板清單見 `BUILT_IN_TEMPLATES`（16 個，涵蓋 auth / commerce / course / support / security 五類）。

## 環境變數

```
RESEND_API_KEY=re_xxx
EMAIL_FROM=no-reply@example.com
```

## 指令

```bash
pnpm typecheck
pnpm lint
pnpm test
```
