import { buildBlockDrivenCollection } from '@saas-factory/cms-pages';

import type { CollectionConfig } from 'payload';

/**
 * Posts collection。
 *
 * 升級為 block-driven 為基底（layout blocks + seo group + versions/drafts + i18n title），
 * 並保留 blog 專屬欄位：content (richText) / excerpt / featuredImage / category / tags /
 * authors / readingTime / viewCount / relatedPosts / series / seriesOrder / commentSource。
 *
 * 整合背景：原 template 自家 BlogPosts collection（slug 'blog-posts'）已 sunset，
 * cms-blog 的 PostsCollection（slug 'posts'）成為唯一 blog 引擎。
 *
 * - layout（blocks）：行銷感 blog post 用 block 排版
 * - content（richText）：長文章主要正文，service.ts / reading-time / rss / related 仍以此為主
 * - author / authors：兩者並存——`author` 對 users（後台帳號），`authors` 對 Authors collection（顯示用署名）
 */
export const PostsCollection: CollectionConfig = buildBlockDrivenCollection({
  slug: 'posts',
  description: 'Blog posts（部落格文章，block-driven layout + rich text 並存）',
  defaultColumns: ['title', 'slug', 'status', 'publishedAt', 'viewCount'],
  extraFields: [
    { name: 'excerpt', type: 'textarea', localized: true, admin: { description: '文章摘要（列表 / SEO 用）' } },
    { name: 'content', type: 'richText' },
    { name: 'plainText', type: 'textarea', admin: { hidden: true } },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'category', type: 'relationship', relationTo: 'categories' },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'authors', type: 'relationship', relationTo: 'authors', hasMany: true },
    { name: 'author', type: 'relationship', relationTo: 'users' },
    { name: 'readingTime', type: 'number', defaultValue: 1 },
    { name: 'viewCount', type: 'number', defaultValue: 0 },
    { name: 'relatedPosts', type: 'relationship', relationTo: 'posts', hasMany: true },
    { name: 'series', type: 'relationship', relationTo: 'post-series' },
    { name: 'seriesOrder', type: 'number' },
    {
      name: 'commentSource',
      type: 'select',
      options: [
        { label: '內建', value: 'builtin' },
        { label: 'Disqus', value: 'disqus' },
        { label: '關閉', value: 'disabled' },
      ],
    },
  ],
});

/** 分類 collection。 */
export const CategoriesCollection: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'parent', type: 'relationship', relationTo: 'categories' },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
  timestamps: true,
};

/** 標籤 collection。 */
export const TagsCollection: CollectionConfig = {
  slug: 'tags',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, index: true },
  ],
  timestamps: true,
};

/** 作者 collection。 */
export const AuthorsCollection: CollectionConfig = {
  slug: 'authors',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'bio', type: 'textarea' },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    {
      name: 'social',
      type: 'array',
      fields: [
        { name: 'platform', type: 'text' },
        { name: 'url', type: 'text' },
      ],
    },
    { name: 'user', type: 'relationship', relationTo: 'users' },
  ],
  timestamps: true,
};

/** 系列文 collection。 */
export const PostSeriesCollection: CollectionConfig = {
  slug: 'post-series',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'cover', type: 'upload', relationTo: 'media' },
  ],
  timestamps: true,
};
