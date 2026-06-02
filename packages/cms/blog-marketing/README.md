# @saas-factory/cms-blog-marketing

部落格行銷整合（CTA + lead magnet + newsletter + 分享 + 點擊追蹤）。

## 功能

- **CTA blocks**：文章內嵌 / 文章結尾 / 側邊欄三種 placement；可依分類或標籤鎖定；weight 排序
- **Lead magnet**：電子書 / 範本，email 換下載；自動觸發 `lead-captured` 行銷事件（goal-07 整合）
- **Newsletter**：double opt-in 訂閱流程；確認後觸發 `newsletter-confirmed` 事件
- **Share**：facebook / twitter / line / telegram / whatsapp / email / copy-link 七平台分享連結
- **點擊追蹤**：CTA / lead-magnet / share 三類事件統一進入 ClickEvent，提供 `getStats()` 聚合

## 使用

```ts
import {
  BlogMarketingService,
  InMemoryBlogMarketingStore,
} from '@saas-factory/cms-blog-marketing';

const service = new BlogMarketingService(new InMemoryBlogMarketingStore(), {
  emailSender: async ({ to, subject, html }) => resend.emails.send({ ... }),
  marketingTrigger: async (event) => marketingAutomation.trigger(event),
  confirmBaseUrl: 'https://x.com/newsletter/confirm',
});

// CTA
const ctas = await service.pickCtasForPost({
  tenantId: 't1',
  postCategoryId: 'cat-1',
  placement: 'end-of-post',
});

// Lead magnet
await service.upsertMagnet({
  tenantId: 't1',
  name: '電子書',
  slug: 'ebook-1',
  fileUrl: 'https://r2.example.com/ebook.pdf',
  fileName: 'ebook.pdf',
});
const { fileUrl } = await service.requestMagnetDownload({
  tenantId: 't1',
  magnetSlug: 'ebook-1',
  email: 'a@b.com',
  sourcePostId: 'post-123',
});

// Newsletter
const sub = await service.subscribeNewsletter({ tenantId: 't1', email: 'a@b.com' });
await service.confirmSubscriber(sub.id);

// Share
const urls = service.buildShareUrls('https://x.com/blog/p1', '文章標題');
await service.recordShareClick({ tenantId: 't1', postId: 'p1', channel: 'facebook' });

// Stats
const stats = await service.getStats('t1');
```

## 指令

```
pnpm typecheck
pnpm lint
pnpm test
```
