import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryCommentStore } from './in-memory-store.js';
import { CommentService } from './service.js';
import { detectSpam } from './spam.js';

const TENANT = 'tenant-1';
const POST = 'post-1';

describe('detectSpam', () => {
  it('honeypot 有值 → spam', () => {
    const r = detectSpam('正常內容', { honeypot: 'bot' });
    expect(r.isSpam).toBe(true);
    expect(r.reasons).toContain('honeypot');
  });
  it('關鍵字命中 → spam', () => {
    const r = detectSpam('便宜 viagra 點我', { blockedKeywords: ['viagra'] });
    expect(r.isSpam).toBe(true);
  });
  it('連結太多 → spam', () => {
    const r = detectSpam('https://a.com https://b.com https://c.com https://d.com', {
      maxLinks: 3,
    });
    expect(r.isSpam).toBe(true);
  });
  it('正常留言 → 不是 spam', () => {
    const r = detectSpam('這篇文章寫得很好，謝謝分享！', {
      blockedKeywords: ['viagra'],
      maxLinks: 3,
      minLength: 2,
      maxLength: 5000,
    });
    expect(r.isSpam).toBe(false);
  });
});

describe('CommentService', () => {
  let store: InMemoryCommentStore;
  let service: CommentService;

  beforeEach(() => {
    store = new InMemoryCommentStore();
    service = new CommentService(store, { blockedKeywords: ['casino'] });
  });

  it('正常留言 → pending（等審核）', async () => {
    const c = await service.createComment({
      tenantId: TENANT,
      postId: POST,
      authorName: '小明',
      authorEmail: 'ming@example.com',
      content: '很棒的文章！',
    });
    expect(c.status).toBe('pending');
  });

  it('honeypot 有填 → 標 spam', async () => {
    const c = await service.createComment({
      tenantId: TENANT,
      postId: POST,
      authorName: 'bot',
      authorEmail: 'bot@x.com',
      content: '推銷內容',
      honeypot: '我是 bot',
    });
    expect(c.status).toBe('spam');
    expect(c.spamReasons).toContain('honeypot');
  });

  it('黑名單關鍵字 → 標 spam', async () => {
    const c = await service.createComment({
      tenantId: TENANT,
      postId: POST,
      authorName: 'X',
      authorEmail: 'x@x.com',
      content: 'play casino now',
    });
    expect(c.status).toBe('spam');
  });

  it('captcha 失敗 → throw', async () => {
    const svc = new CommentService(store, {
      verifyCaptcha: async () => false,
    });
    await expect(
      svc.createComment({
        tenantId: TENANT,
        postId: POST,
        authorName: 'X',
        authorEmail: 'x@x.com',
        content: '哈囉',
        captchaToken: 'bad',
      }),
    ).rejects.toThrow(/captcha/);
  });

  it('captcha 通過 → 建立', async () => {
    const svc = new CommentService(store, { verifyCaptcha: async () => true });
    const c = await svc.createComment({
      tenantId: TENANT,
      postId: POST,
      authorName: 'X',
      authorEmail: 'x@x.com',
      content: '正常留言',
      captchaToken: 'good',
    });
    expect(c.status).toBe('pending');
  });

  it('rate limit：同 IP 超量 → throw', async () => {
    const svc = new CommentService(store, { rateLimit: 2, rateLimitWindowMs: 60_000 });
    const ip = '1.2.3.4';
    for (let i = 0; i < 2; i += 1) {
      await svc.createComment({
        tenantId: TENANT,
        postId: POST,
        authorName: 'X',
        authorEmail: 'x@x.com',
        content: `留言 ${i}`,
        ipAddress: ip,
      });
    }
    await expect(
      svc.createComment({
        tenantId: TENANT,
        postId: POST,
        authorName: 'X',
        authorEmail: 'x@x.com',
        content: '第三次',
        ipAddress: ip,
      }),
    ).rejects.toThrow(/頻繁/);
  });

  it('approve / reject / markSpam', async () => {
    const c = await service.createComment({
      tenantId: TENANT,
      postId: POST,
      authorName: 'A',
      authorEmail: 'a@a.com',
      content: '哈囉',
    });
    const approved = await service.approve(c.id);
    expect(approved.status).toBe('approved');
    const spam = await service.markSpam(c.id);
    expect(spam.status).toBe('spam');
    const rejected = await service.reject(c.id);
    expect(rejected.status).toBe('rejected');
  });

  it('listApproved 只回已核准', async () => {
    const a = await service.createComment({
      tenantId: TENANT,
      postId: POST,
      authorName: 'A',
      authorEmail: 'a@a.com',
      content: '一',
    });
    await service.createComment({
      tenantId: TENANT,
      postId: POST,
      authorName: 'B',
      authorEmail: 'b@b.com',
      content: '二',
    });
    await service.approve(a.id);
    const list = await service.listApproved(TENANT, POST);
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe(a.id);
  });

  it('listThread：parent + child 巢狀', async () => {
    const parent = await service.createComment({
      tenantId: TENANT,
      postId: POST,
      authorName: 'P',
      authorEmail: 'p@p.com',
      content: '父留言',
    });
    await service.approve(parent.id);
    const child = await service.createComment({
      tenantId: TENANT,
      postId: POST,
      parentId: parent.id,
      authorName: 'C',
      authorEmail: 'c@c.com',
      content: '回覆',
    });
    await service.approve(child.id);
    const thread = await service.listThread(TENANT, POST);
    expect(thread).toHaveLength(1);
    expect(thread[0]?.children).toHaveLength(1);
    expect(thread[0]?.children[0]?.id).toBe(child.id);
  });

  it('listPending', async () => {
    await service.createComment({
      tenantId: TENANT,
      postId: POST,
      authorName: 'X',
      authorEmail: 'x@x.com',
      content: '待審',
    });
    const pend = await service.listPending(TENANT);
    expect(pend).toHaveLength(1);
  });
});
