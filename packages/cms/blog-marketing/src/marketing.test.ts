import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InMemoryBlogMarketingStore } from './in-memory-store.js';
import { BlogMarketingService } from './service.js';
import { buildAllShareUrls, buildShareUrl } from './share-links.js';

const TENANT = 'tenant-1';

describe('share-links', () => {
  it('Facebook', () => {
    const url = buildShareUrl('facebook', 'https://x.com/a', 'title');
    expect(url).toContain('facebook.com/sharer');
    expect(url).toContain(encodeURIComponent('https://x.com/a'));
  });
  it('Twitter 含 text', () => {
    const url = buildShareUrl('twitter', 'https://x.com/a', '哈囉');
    expect(url).toContain('twitter.com/intent/tweet');
    expect(url).toContain(encodeURIComponent('哈囉'));
  });
  it('Line', () => {
    expect(buildShareUrl('line', 'https://x.com/a')).toContain('line.me/lineit/share');
  });
  it('buildAllShareUrls 含 7 平台', () => {
    const all = buildAllShareUrls('https://x.com/a', 't');
    expect(Object.keys(all)).toHaveLength(7);
    expect(all['copy-link']).toBe('https://x.com/a');
  });
});

describe('BlogMarketingService - CTA', () => {
  let store: InMemoryBlogMarketingStore;
  let service: BlogMarketingService;

  beforeEach(() => {
    store = new InMemoryBlogMarketingStore();
    service = new BlogMarketingService(store);
  });

  it('全站 CTA + 分類 CTA：依分類過濾', async () => {
    const global = await service.upsertCta({
      tenantId: TENANT,
      name: '全站',
      placement: 'end-of-post',
      heading: 'h',
      buttonLabel: 'b',
      buttonUrl: '/',
    });
    const tagged = await service.upsertCta({
      tenantId: TENANT,
      name: '分類專屬',
      placement: 'end-of-post',
      heading: 'h',
      buttonLabel: 'b',
      buttonUrl: '/',
      categoryIds: ['cat-1'],
      weight: 5,
    });
    const other = await service.upsertCta({
      tenantId: TENANT,
      name: '其他分類',
      placement: 'end-of-post',
      heading: 'h',
      buttonLabel: 'b',
      buttonUrl: '/',
      categoryIds: ['cat-2'],
    });
    const r = await service.pickCtasForPost({
      tenantId: TENANT,
      postCategoryId: 'cat-1',
      placement: 'end-of-post',
    });
    expect(r.map((c) => c.id)).toEqual([tagged.id, global.id]);
    expect(r).not.toContainEqual(expect.objectContaining({ id: other.id }));
  });

  it('placement 不符 → 不列入', async () => {
    await service.upsertCta({
      tenantId: TENANT,
      name: 'inline',
      placement: 'inline',
      heading: 'h',
      buttonLabel: 'b',
      buttonUrl: '/',
    });
    const r = await service.pickCtasForPost({
      tenantId: TENANT,
      placement: 'end-of-post',
    });
    expect(r).toHaveLength(0);
  });

  it('enabled=false 不列入', async () => {
    await service.upsertCta({
      tenantId: TENANT,
      name: 'X',
      placement: 'sidebar',
      heading: 'h',
      buttonLabel: 'b',
      buttonUrl: '/',
      enabled: false,
    });
    const r = await service.pickCtasForPost({ tenantId: TENANT, placement: 'sidebar' });
    expect(r).toHaveLength(0);
  });

  it('recordCtaClick → 統計累加', async () => {
    const c = await service.upsertCta({
      tenantId: TENANT,
      name: 'X',
      placement: 'inline',
      heading: 'h',
      buttonLabel: 'b',
      buttonUrl: '/',
    });
    await service.recordCtaClick({ tenantId: TENANT, ctaId: c.id });
    await service.recordCtaClick({ tenantId: TENANT, ctaId: c.id });
    const stats = await service.getStats(TENANT);
    expect(stats.ctaClicks[c.id]).toBe(2);
  });
});

describe('Lead magnet 流程', () => {
  let store: InMemoryBlogMarketingStore;
  let service: BlogMarketingService;
  let trigger: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    store = new InMemoryBlogMarketingStore();
    trigger = vi.fn(async () => undefined);
    service = new BlogMarketingService(store, { marketingTrigger: trigger });
  });

  it('email 換下載：建 lead + 觸發行銷事件 + 回傳檔案', async () => {
    await service.upsertMagnet({
      tenantId: TENANT,
      name: 'EBook',
      slug: 'ebook',
      fileUrl: 'https://r2.example.com/ebook.pdf',
      fileName: 'ebook.pdf',
    });
    const r = await service.requestMagnetDownload({
      tenantId: TENANT,
      magnetSlug: 'ebook',
      email: 'a@b.com',
      sourcePostId: 'post-1',
    });
    expect(r.fileUrl).toBe('https://r2.example.com/ebook.pdf');
    expect(trigger).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: 'lead-captured',
        payload: expect.objectContaining({ email: 'a@b.com', magnetSlug: 'ebook' }),
      }),
    );
    const leads = await service.listLeadCaptures(TENANT);
    expect(leads).toHaveLength(1);
    expect(leads[0]?.email).toBe('a@b.com');
  });

  it('email 格式錯 → throw', async () => {
    await service.upsertMagnet({
      tenantId: TENANT,
      name: 'M',
      slug: 'm',
      fileUrl: '/x',
      fileName: 'x',
    });
    await expect(
      service.requestMagnetDownload({
        tenantId: TENANT,
        magnetSlug: 'm',
        email: 'bad-email',
      }),
    ).rejects.toThrow(/email/);
  });

  it('找不到 magnet → throw', async () => {
    await expect(
      service.requestMagnetDownload({
        tenantId: TENANT,
        magnetSlug: 'not-exist',
        email: 'a@b.com',
      }),
    ).rejects.toThrow(/找不到/);
  });

  it('lead-magnet 點擊統計', async () => {
    const m = await service.upsertMagnet({
      tenantId: TENANT,
      name: 'M',
      slug: 'm',
      fileUrl: '/x',
      fileName: 'x',
    });
    await service.requestMagnetDownload({
      tenantId: TENANT,
      magnetSlug: 'm',
      email: 'a@b.com',
    });
    const stats = await service.getStats(TENANT);
    expect(stats.magnetDownloads[m.id]).toBe(1);
  });
});

describe('Newsletter', () => {
  let store: InMemoryBlogMarketingStore;
  let service: BlogMarketingService;
  let emailSender: ReturnType<typeof vi.fn>;
  let trigger: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    store = new InMemoryBlogMarketingStore();
    emailSender = vi.fn(async () => undefined);
    trigger = vi.fn(async () => undefined);
    service = new BlogMarketingService(store, {
      emailSender,
      marketingTrigger: trigger,
      confirmBaseUrl: 'https://x.com/confirm',
    });
  });

  it('訂閱 → 寄確認信、confirmed=false', async () => {
    const s = await service.subscribeNewsletter({
      tenantId: TENANT,
      email: 'a@b.com',
      source: 'post-1',
    });
    expect(s.confirmed).toBe(false);
    expect(emailSender).toHaveBeenCalledOnce();
    expect(emailSender.mock.calls[0]?.[0].html).toContain(`https://x.com/confirm/${s.id}`);
  });

  it('已確認 + 未退訂 → 不重複寄信、直接回傳', async () => {
    const s = await service.subscribeNewsletter({ tenantId: TENANT, email: 'a@b.com' });
    await service.confirmSubscriber(s.id);
    emailSender.mockClear();
    const again = await service.subscribeNewsletter({ tenantId: TENANT, email: 'a@b.com' });
    expect(again.confirmed).toBe(true);
    expect(emailSender).not.toHaveBeenCalled();
  });

  it('confirm → 觸發 newsletter-confirmed 事件', async () => {
    const s = await service.subscribeNewsletter({ tenantId: TENANT, email: 'a@b.com' });
    await service.confirmSubscriber(s.id);
    expect(trigger).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: 'newsletter-confirmed' }),
    );
  });

  it('退訂', async () => {
    const s = await service.subscribeNewsletter({ tenantId: TENANT, email: 'a@b.com' });
    await service.confirmSubscriber(s.id);
    const un = await service.unsubscribe({ tenantId: TENANT, email: 'a@b.com' });
    expect(un.unsubscribedAt).toBeInstanceOf(Date);
  });

  it('email 格式錯 → throw', async () => {
    await expect(
      service.subscribeNewsletter({ tenantId: TENANT, email: 'bad' }),
    ).rejects.toThrow(/email/);
  });
});

describe('Share 統計', () => {
  it('recordShareClick → stats.shareClicks 累加', async () => {
    const store = new InMemoryBlogMarketingStore();
    const service = new BlogMarketingService(store);
    await service.recordShareClick({ tenantId: TENANT, postId: 'p1', channel: 'facebook' });
    await service.recordShareClick({ tenantId: TENANT, postId: 'p1', channel: 'facebook' });
    await service.recordShareClick({ tenantId: TENANT, postId: 'p1', channel: 'line' });
    const stats = await service.getStats(TENANT);
    expect(stats.shareClicks.p1?.facebook).toBe(2);
    expect(stats.shareClicks.p1?.line).toBe(1);
  });

  it('buildShareUrls 含 7 平台 URL', () => {
    const store = new InMemoryBlogMarketingStore();
    const service = new BlogMarketingService(store);
    const urls = service.buildShareUrls('https://x.com/p/1', '文章標題');
    expect(urls.facebook).toContain('facebook.com');
    expect(urls['copy-link']).toBe('https://x.com/p/1');
  });
});
