# @saas-factory/lp-version-control

LP 頁面版本管理：每次儲存自動建版本、命名 / 註解、還原舊版、排程上線、預覽連結（可加密）。

## 用法

```ts
import { LpVersionControlService, InMemoryLpVersionStore, InMemoryPreviewLinkStore } from '@saas-factory/lp-version-control';

const svc = new LpVersionControlService(versions, previews, {
  passwordHasher: bcryptHash,
  passwordVerifier: bcryptVerify,
});

// 每次儲存呼叫
const v = await svc.createVersion({
  tenantId, pageId, snapshot: { pageData },
  createdBy: userId,
  name: '夏季特賣 v3',
  note: '依老闆指示加長 hero',
});

// 還原舊版（自動 copy 成新版本）
await svc.restore(oldVersionId, userId);

// 立即上線
await svc.promoteToProduction(v.id);

// 排程
await svc.schedule(v.id, new Date('2026-05-20T00:00:00Z'));
// cron 定時呼叫
await svc.runScheduledPromotion(tenantId, pageId);

// 預覽連結（給客戶看）
const link = await svc.createPreviewLink({ versionId: v.id, password: 'taco', expiresAt: new Date(...) });
// URL: /preview/{link.token}
```

## 注意

- 同一 page 同時只能有 1 個 `isProduction=true`，promote 時其他自動歸 false。
- `restore` 不直接覆蓋舊版，而是 copy 一份成新版本（保留歷史）。
- 預覽連結密碼比對由外層注入（bcrypt / argon2）。
