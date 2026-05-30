import { beforeEach, describe, expect, it } from 'vitest';

import { InMemoryBlogStore } from './in-memory-store.js';
import { estimateReadingTime, extractPlainText } from './reading-time.js';
import { suggestRelated } from './related.js';
import { generateRss } from './rss.js';
import { BlogService } from './service.js';

import type { Post } from './types.js';

const TENANT = 'tenant-1';

function lexical(text: string): unknown {
  return { root: { children: [{ type: 'paragraph', children: [{ text }] }] } };
}

describe('reading-time', () => {
  it('純中文 600 字 → 2 分鐘', () => {
    const text = '中'.repeat(600);
    expect(estimateReadingTime(text)).toBe(2);
  });
  it('純英文 500 字 → 2 分鐘', () => {
    const text = 'word '.repeat(500);
    expect(estimateReadingTime(text)).toBe(2);
  });
  it('短文 → 最少 1 分鐘', () => {
    expect(estimateReadingTime('短')).toBe(1);
  });
  it('extractPlainText 遞迴抓 text', () => {
    expect(extractPlainText(lexical('哈囉世界'))).toBe('哈囉世界');
  });
});

describe('BlogService', () => {
  let store: InMemoryBlogStore;
  let service: BlogService;
  let authorId: string;

  beforeEach(async () => {
    store = new InMemoryBlogStore();
    service = new BlogService(store);
    const author = await service.createAuthor({ tenantId: TENANT, name: '王小明' });
    authorId = author.id;
  });

  it('建立文章 + 自動估算 readingTime', async () => {
    const post = await service.createPost({
      tenantId: TENANT,
      title: 'Hello',
      slug: 'hello',
      content: lexical('哈囉'.repeat(300)),
      authorIds: [authorId],
    });
    expect(post.readingTime).toBeGreaterThanOrEqual(2);
    expect(post.status).toBe('draft');
  });

  it('沒有作者 → throw', async () => {
    await expect(
      service.createPost({
        tenantId: TENANT,
        title: 'X',
        slug: 'x',
        content: lexical('內容'),
        authorIds: [],
      }),
    ).rejects.toThrow(/作者/);
  });

  it('slug 重複 → throw', async () => {
    await service.createPost({
      tenantId: TENANT,
      title: 'A',
      slug: 'same',
      content: lexical('a'),
      authorIds: [authorId],
    });
    await expect(
      service.createPost({
        tenantId: TENANT,
        title: 'B',
        slug: 'same',
        content: lexical('b'),
        authorIds: [authorId],
      }),
    ).rejects.toThrow(/slug 已存在/);
  });

  it('publish + 排程', async () => {
    const p = await service.createPost({
      tenantId: TENANT,
      title: 'P',
      slug: 'p',
      content: lexical('c'),
      authorIds: [authorId],
    });
    const future = new Date(Date.now() + 60_000);
    await service.schedulePost(p.id, future);
    const due = await service.publishScheduled(TENANT, new Date(future.getTime() + 1_000));
    expect(due).toHaveLength(1);
    expect(due[0]?.status).toBe('published');
  });

  it('incrementView 累計（僅 published）', async () => {
    const p = await service.createPost({
      tenantId: TENANT,
      title: 'V',
      slug: 'v',
      content: lexical('c'),
      authorIds: [authorId],
      status: 'published',
    });
    await service.incrementView(p.id);
    await service.incrementView(p.id);
    const fresh = await store.findPostById(p.id);
    expect(fresh?.viewCount).toBe(2);
  });

  it('incrementView 對 draft 文章丟錯', async () => {
    const p = await service.createPost({
      tenantId: TENANT,
      title: 'D',
      slug: 'd',
      content: lexical('c'),
      authorIds: [authorId],
    });
    await expect(service.incrementView(p.id)).rejects.toThrow(/未發布/);
  });

  it('findPublishedBySlug 過濾 draft', async () => {
    await service.createPost({
      tenantId: TENANT,
      title: 'Draft',
      slug: 'draft-post',
      content: lexical('c'),
      authorIds: [authorId],
    });
    expect(await service.findPublishedBySlug(TENANT, 'draft-post')).toBeUndefined();
    await service.createPost({
      tenantId: TENANT,
      title: 'Published',
      slug: 'pub-post',
      content: lexical('c'),
      authorIds: [authorId],
      status: 'published',
    });
    const pub = await service.findPublishedBySlug(TENANT, 'pub-post');
    expect(pub?.slug).toBe('pub-post');
  });

  it('系列文按 seriesOrder 排序', async () => {
    const series = await service.createSeries({ tenantId: TENANT, name: 'S', slug: 's' });
    for (const [i, slug] of [[2, 'b'], [1, 'a'], [3, 'c']] as Array<[number, string]>) {
      await service.createPost({
        tenantId: TENANT,
        title: slug,
        slug,
        content: lexical('c'),
        authorIds: [authorId],
        seriesId: series.id,
        seriesOrder: i,
        status: 'published',
      });
    }
    const list = await service.listSeriesPosts(TENANT, series.id);
    expect(list.map((p) => p.slug)).toEqual(['a', 'b', 'c']);
  });

  it('RSS 含已發布文章', async () => {
    const p = await service.createPost({
      tenantId: TENANT,
      title: 'R',
      slug: 'r',
      excerpt: '摘要 & 範例',
      content: lexical('r'),
      authorIds: [authorId],
      status: 'published',
    });
    const xml = await service.generateRssFeed(TENANT, {
      title: 'Blog',
      description: 'desc',
      link: 'https://example.com',
      feedUrl: 'https://example.com/rss.xml',
    });
    expect(xml).toContain('<?xml');
    expect(xml).toContain('<item>');
    expect(xml).toContain(p.title);
    expect(xml).toContain('摘要 &amp; 範例');
  });

  it('草稿不出現在 RSS', async () => {
    await service.createPost({
      tenantId: TENANT,
      title: 'D',
      slug: 'd',
      content: lexical('d'),
      authorIds: [authorId],
    });
    const xml = await service.generateRssFeed(TENANT, {
      title: 't',
      description: 'd',
      link: 'https://e.com',
      feedUrl: 'https://e.com/rss.xml',
    });
    expect(xml).not.toContain('<item>');
  });
});

describe('suggestRelated', () => {
  const now = new Date('2026-05-15T00:00:00Z');
  const base: Omit<Post, 'id' | 'slug' | 'title'> = {
    tenantId: 't',
    content: {},
    tagIds: [],
    authorIds: ['a1'],
    status: 'published',
    readingTime: 1,
    viewCount: 0,
    relatedPostIds: [],
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  };

  it('共標籤 / 同分類 / 同系列 累加分數', () => {
    const target: Post = {
      ...base,
      id: 't1',
      slug: 't',
      title: '主文章',
      tagIds: ['x', 'y'],
      categoryId: 'c1',
      seriesId: 's1',
    };
    const pool: Post[] = [
      { ...base, id: 'p1', slug: 'p1', title: '同分類', categoryId: 'c1', tagIds: [] },
      { ...base, id: 'p2', slug: 'p2', title: '同 tag', categoryId: 'c2', tagIds: ['x'] },
      { ...base, id: 'p3', slug: 'p3', title: '同系列', seriesId: 's1', tagIds: [] },
      { ...base, id: 'p4', slug: 'p4', title: '無關', tagIds: ['z'] },
    ];
    const results = suggestRelated(target, pool, { now });
    // 同系列分數最高（5），第一名是 p3
    expect(results[0]?.id).toBe('p3');
    expect(results.find((r) => r.id === 'p4')).toBeUndefined();
  });
});

describe('generateRss xml escape', () => {
  it('< > & 都被轉義', () => {
    const xml = generateRss([], {
      title: 'A & B <test>',
      description: 'd',
      link: 'https://e.com',
      feedUrl: 'https://e.com/rss.xml',
    });
    expect(xml).toContain('A &amp; B &lt;test&gt;');
  });
});
