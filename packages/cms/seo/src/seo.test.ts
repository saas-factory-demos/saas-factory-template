import { describe, expect, it } from 'vitest';

import { InMemoryBrokenLinkStore } from './broken-links.js';
import { generateHreflangTags, toNextLanguages } from './hreflang.js';
import {
  articleJsonLd,
  breadcrumbJsonLd,
  courseJsonLd,
  faqJsonLd,
  organizationJsonLd,
  productJsonLd,
  websiteJsonLd,
} from './json-ld.js';
import { toNextMetadata } from './metadata.js';
import { articleOgLayout, courseOgLayout, lpOgLayout, productOgLayout } from './og-layouts.js';
import { generateRobotsTxt } from './robots.js';
import { generateSitemap, generateSitemapIndex } from './sitemap.js';

describe('og-layouts', () => {
  it('product layout 含標題與價格', () => {
    const tree = productOgLayout({ title: '商品 A', price: 'NT$1,200', brand: '品牌 X' });
    const json = JSON.stringify(tree);
    expect(json).toContain('商品 A');
    expect(json).toContain('NT$1,200');
    expect(json).toContain('品牌 X');
  });
  it('article layout 含作者與日期', () => {
    const tree = articleOgLayout({
      title: '部落格文章',
      authorName: '小明',
      publishedAt: new Date('2026-05-15T00:00:00Z'),
    });
    const json = JSON.stringify(tree);
    expect(json).toContain('部落格文章');
    expect(json).toContain('作者：小明');
    expect(json).toContain('2026');
  });
  it('course layout 含講師 + 時長', () => {
    const tree = courseOgLayout({
      title: '課程 A',
      instructor: '王老師',
      durationMinutes: 120,
    });
    const json = JSON.stringify(tree);
    expect(json).toContain('講師：王老師');
    expect(json).toContain('2 小時');
  });
  it('lp layout 含 subtitle', () => {
    const tree = lpOgLayout({ title: '主標題', subtitle: '副標題' });
    expect(JSON.stringify(tree)).toContain('副標題');
  });
});

describe('json-ld', () => {
  it('organization 含 sameAs', () => {
    const ld = organizationJsonLd({
      name: 'X 公司',
      url: 'https://x.com',
      logo: 'https://x.com/logo.png',
      sameAs: ['https://fb.com/x', 'https://line.me/x'],
    });
    expect(ld['@type']).toBe('Organization');
    expect(ld.sameAs).toEqual(['https://fb.com/x', 'https://line.me/x']);
  });

  it('article datePublished ISO', () => {
    const ld = articleJsonLd({
      headline: 'H',
      authorName: '小明',
      publisherName: 'X',
      datePublished: new Date('2026-05-15T00:00:00Z'),
      url: 'https://x.com/blog/h',
    });
    expect(ld.datePublished).toBe('2026-05-15T00:00:00.000Z');
    expect(ld.dateModified).toBe('2026-05-15T00:00:00.000Z');
  });

  it('product 含 Offer + AggregateRating', () => {
    const ld = productJsonLd({
      name: '商品',
      price: 1200,
      priceCurrency: 'TWD',
      url: 'https://x.com/p/1',
      rating: { value: 4.5, reviewCount: 20 },
    });
    const offers = ld.offers as Record<string, unknown>;
    expect(offers.price).toBe(1200);
    expect(offers.availability).toBe('https://schema.org/InStock');
    expect(ld.aggregateRating).toBeDefined();
  });

  it('course 含 instructor', () => {
    const ld = courseJsonLd({
      name: '課程',
      description: '描述',
      provider: { name: 'X', url: 'https://x.com' },
      instructorName: '王老師',
      url: 'https://x.com/c/1',
    });
    expect(ld.instructor).toEqual({ '@type': 'Person', name: '王老師' });
  });

  it('breadcrumb positions', () => {
    const ld = breadcrumbJsonLd([
      { name: '首頁', url: 'https://x.com' },
      { name: '商品', url: 'https://x.com/products' },
    ]);
    const items = ld.itemListElement as Array<{ position: number; name: string }>;
    expect(items[0]?.position).toBe(1);
    expect(items[1]?.position).toBe(2);
  });

  it('faq', () => {
    const ld = faqJsonLd([
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
    ]);
    expect(ld['@type']).toBe('FAQPage');
    expect((ld.mainEntity as unknown[]).length).toBe(2);
  });

  it('website 含 SearchAction', () => {
    const ld = websiteJsonLd({
      name: 'X',
      url: 'https://x.com',
      searchUrlTemplate: 'https://x.com/search?q={search_term_string}',
    });
    expect(ld.potentialAction).toBeDefined();
  });
});

describe('sitemap', () => {
  it('xml 結構正確', () => {
    const xml = generateSitemap([
      {
        loc: 'https://x.com/',
        lastmod: new Date('2026-05-15T00:00:00Z'),
        changefreq: 'daily',
        priority: 1.0,
      },
      { loc: 'https://x.com/blog' },
    ]);
    expect(xml).toContain('<?xml');
    expect(xml).toContain('<urlset');
    expect(xml).toContain('<loc>https://x.com/</loc>');
    expect(xml).toContain('<lastmod>2026-05-15</lastmod>');
    expect(xml).toContain('<changefreq>daily</changefreq>');
    expect(xml).toContain('<priority>1.0</priority>');
  });

  it('& 轉義', () => {
    const xml = generateSitemap([{ loc: 'https://x.com/q?a=1&b=2' }]);
    expect(xml).toContain('a=1&amp;b=2');
  });

  it('sitemap index', () => {
    const xml = generateSitemapIndex([
      { loc: 'https://x.com/sitemap-1.xml', lastmod: new Date('2026-01-01T00:00:00Z') },
    ]);
    expect(xml).toContain('<sitemapindex');
    expect(xml).toContain('<sitemap>');
  });
});

describe('robots', () => {
  it('多 user-agent + sitemap', () => {
    const txt = generateRobotsTxt({
      rules: [
        { userAgent: '*', allow: ['/'], disallow: ['/admin'] },
        { userAgent: 'GPTBot', disallow: ['/'] },
      ],
      sitemapUrls: ['https://x.com/sitemap.xml'],
    });
    expect(txt).toContain('User-agent: *');
    expect(txt).toContain('Disallow: /admin');
    expect(txt).toContain('User-agent: GPTBot');
    expect(txt).toContain('Sitemap: https://x.com/sitemap.xml');
  });
});

describe('hreflang', () => {
  it('產生 link 標籤 + x-default', () => {
    const tags = generateHreflangTags([
      { lang: 'zh-TW', url: 'https://x.com/zh' },
      { lang: 'en', url: 'https://x.com/en' },
    ]);
    expect(tags).toHaveLength(3);
    expect(tags[2]).toContain('hreflang="x-default"');
  });
  it('toNextLanguages', () => {
    expect(
      toNextLanguages([
        { lang: 'zh-TW', url: '/zh' },
        { lang: 'en', url: '/en' },
      ]),
    ).toEqual({ 'zh-TW': '/zh', en: '/en' });
  });
});

describe('toNextMetadata', () => {
  it('noindex 反映在 robots.index', () => {
    const m = toNextMetadata(
      { noindex: true, nofollow: false, metaTitle: 'T' },
      { title: 'fallback' },
    );
    expect(m.robots.index).toBe(false);
    expect(m.robots.follow).toBe(true);
    expect(m.title).toBe('T');
  });
  it('canonical 帶入 alternates', () => {
    const m = toNextMetadata(
      { canonical: 'https://x.com/a' },
      { title: 'fallback' },
    );
    expect(m.alternates.canonical).toBe('https://x.com/a');
  });
  it('og image fallback', () => {
    const m = toNextMetadata(
      { ogImage: 'https://x.com/og.png' },
      { title: 'T', defaultOgImage: 'https://x.com/default.png' },
    );
    expect(m.openGraph.images).toEqual(['https://x.com/og.png']);
  });
});

describe('InMemoryBrokenLinkStore', () => {
  it('同 path 多次 hit → hitCount 累加', async () => {
    const store = new InMemoryBrokenLinkStore();
    await store.recordHit({ tenantId: 't1', path: '/old-page' });
    await store.recordHit({ tenantId: 't1', path: '/old-page' });
    const r = await store.recordHit({ tenantId: 't1', path: '/old-page' });
    expect(r.hitCount).toBe(3);
  });

  it('list + markResolved', async () => {
    const store = new InMemoryBrokenLinkStore();
    const r = await store.recordHit({ tenantId: 't1', path: '/x' });
    await store.markResolved(r.id);
    const open = await store.list('t1', { resolved: false });
    expect(open).toEqual([]);
    const done = await store.list('t1', { resolved: true });
    expect(done).toHaveLength(1);
  });

  it('依 hitCount 降冪', async () => {
    const store = new InMemoryBrokenLinkStore();
    await store.recordHit({ tenantId: 't1', path: '/a' });
    await store.recordHit({ tenantId: 't1', path: '/b' });
    await store.recordHit({ tenantId: 't1', path: '/b' });
    const list = await store.list('t1');
    expect(list[0]?.path).toBe('/b');
  });
});
