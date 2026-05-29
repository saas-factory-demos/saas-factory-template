# @saas-factory/cms-comments

內建留言系統（後台審核 + honeypot + captcha + rate limit + 反垃圾關鍵字）。

## 功能

- 4 狀態：`pending` / `approved` / `spam` / `rejected`
- Honeypot 欄位偵測 bot
- Captcha verifier 接口（可接 reCAPTCHA / hCaptcha）
- 同 IP rate limit（預設 60 秒 5 則）
- 關鍵字黑名單 + 連結數上限
- 巢狀回覆（`parentId`）
- 樹狀輸出（`listThread()`）

## 使用

```ts
import { CommentService, InMemoryCommentStore } from '@saas-factory/cms-comments';

const service = new CommentService(new InMemoryCommentStore(), {
  blockedKeywords: ['casino', 'viagra'],
  verifyCaptcha: async (token) => {
    // 接 reCAPTCHA / hCaptcha
    return true;
  },
});

const c = await service.createComment({
  tenantId: 't1',
  postId: 'post-123',
  authorName: '小明',
  authorEmail: 'ming@example.com',
  content: '很棒的文章！',
  ipAddress: req.ip,
  captchaToken: req.body.captchaToken,
});

// 後台
const pending = await service.listPending('t1');
await service.approve(c.id);

// 前台
const thread = await service.listThread('t1', 'post-123');
```

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
