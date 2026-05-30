import { describe, expect, it } from 'vitest';

import {
  buildBlockDrivenCollection,
  buildPagesCollection,
  buildPayloadBlocksFromRegistry,
  buildSeoGroupField,
  buildStatusField,
} from './collections.js';

import type { Field } from 'payload';

describe('buildPayloadBlocksFromRegistry', () => {
  it('產出至少 1 個 Block（吃 BLOCK_REGISTRY）', () => {
    const blocks = buildPayloadBlocksFromRegistry();
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks[0]).toMatchObject({
      slug: expect.any(String),
      fields: expect.any(Array),
    });
  });
});

describe('buildSeoGroupField', () => {
  it('SEO group 含 9 欄位 + metaTitle/Description localized', () => {
    const seo = buildSeoGroupField();
    expect(seo.type).toBe('group');
    if (seo.type !== 'group') throw new Error('expected group');
    const names = seo.fields.map((f) => 'name' in f && f.name);
    expect(names).toEqual(
      expect.arrayContaining([
        'metaTitle',
        'metaDescription',
        'canonical',
        'ogImage',
        'ogTitle',
        'ogDescription',
        'noindex',
        'nofollow',
        'keywords',
      ]),
    );
    const metaTitle = seo.fields.find((f) => 'name' in f && f.name === 'metaTitle') as Field & {
      localized?: boolean;
    };
    expect(metaTitle?.localized).toBe(true);
  });
});

describe('buildStatusField', () => {
  it('status 為 select + 3 個選項', () => {
    const status = buildStatusField();
    expect(status.type).toBe('select');
    if (status.type !== 'select') throw new Error('expected select');
    expect(status.options).toHaveLength(3);
  });
});

describe('buildBlockDrivenCollection', () => {
  it('基本 collection（無 hierarchy / parent）', () => {
    const c = buildBlockDrivenCollection({ slug: 'shop-pages' });
    expect(c.slug).toBe('shop-pages');
    expect(c.versions).toEqual({ drafts: true, maxPerDoc: 50 });
    const names = c.fields.map((f) => 'name' in f && f.name);
    expect(names).toContain('tenantId');
    expect(names).toContain('title');
    expect(names).toContain('slug');
    expect(names).toContain('layout');
    expect(names).toContain('seo');
    expect(names).not.toContain('parent');
    expect(names).not.toContain('isHomepage');
  });

  it('enableParent 加 parent (self-relationship)', () => {
    const c = buildBlockDrivenCollection({ slug: 'pages', enableParent: true });
    const parent = c.fields.find((f) => 'name' in f && f.name === 'parent') as Field & {
      relationTo?: string;
    };
    expect(parent?.relationTo).toBe('pages');
  });

  it('enableHierarchy 加 isHomepage + sortOrder', () => {
    const c = buildBlockDrivenCollection({ slug: 'pages', enableHierarchy: true });
    const names = c.fields.map((f) => 'name' in f && f.name);
    expect(names).toContain('isHomepage');
    expect(names).toContain('sortOrder');
  });

  it('extraFields 插在 status 前', () => {
    const c = buildBlockDrivenCollection({
      slug: 'blog-posts',
      extraFields: [{ name: 'author', type: 'text' }],
    });
    const names = c.fields.map((f) => 'name' in f && f.name);
    const authorIdx = names.indexOf('author');
    const statusIdx = names.indexOf('status');
    expect(authorIdx).toBeGreaterThanOrEqual(0);
    expect(authorIdx).toBeLessThan(statusIdx);
  });

  it('title / layout localized = true', () => {
    const c = buildBlockDrivenCollection({ slug: 'pages' });
    const title = c.fields.find((f) => 'name' in f && f.name === 'title') as Field & {
      localized?: boolean;
    };
    const layout = c.fields.find((f) => 'name' in f && f.name === 'layout') as Field & {
      localized?: boolean;
    };
    expect(title?.localized).toBe(true);
    expect(layout?.localized).toBe(true);
  });
});

describe('buildPagesCollection', () => {
  it('pages 含 parent + hierarchy + layout + seo', () => {
    const c = buildPagesCollection();
    expect(c.slug).toBe('pages');
    const names = c.fields.map((f) => 'name' in f && f.name);
    expect(names).toEqual(
      expect.arrayContaining(['tenantId', 'title', 'slug', 'parent', 'isHomepage', 'layout', 'seo']),
    );
  });
});
