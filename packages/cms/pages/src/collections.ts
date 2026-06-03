import { zodBlockToPayloadFields } from '@saas-factory/cms-zod-payload';
import { BLOCK_REGISTRY } from '@saas-factory/frontend-blocks';

import type { Block, CollectionConfig, CollectionSlug, Field } from 'payload';

/**
 * 由 blocks-library BLOCK_REGISTRY 自動生成 Payload Block[]。
 *
 * 每個 block 的 fields 用 zod-payload adapter 從 Zod schema 自動轉。
 * 後台 Pages collection 的 `layout` blocks field 直接吃此 array。
 */
export function buildPayloadBlocksFromRegistry(): Block[] {
  return Object.entries(BLOCK_REGISTRY).map(([slug, entry]) => ({
    slug,
    labels: { singular: entry.displayName, plural: entry.displayName },
    fields: zodBlockToPayloadFields(entry.schema),
  }));
}

/**
 * SEO group field（多語）。給 4 個主 collections（pages / shop-pages /
 * course-pages / blog-posts）共用。
 */
export function buildSeoGroupField(): Field {
  return {
    name: 'seo',
    type: 'group',
    fields: [
      { name: 'metaTitle', type: 'text', localized: true },
      { name: 'metaDescription', type: 'textarea', localized: true },
      { name: 'canonical', type: 'text' },
      { name: 'ogImage', type: 'upload', relationTo: 'media' },
      { name: 'ogTitle', type: 'text', localized: true },
      { name: 'ogDescription', type: 'textarea', localized: true },
      { name: 'noindex', type: 'checkbox', defaultValue: false },
      { name: 'nofollow', type: 'checkbox', defaultValue: false },
      { name: 'keywords', type: 'array', fields: [{ name: 'value', type: 'text' }] },
    ],
  };
}

/**
 * Status select field（draft / published / archived）。
 */
export function buildStatusField(): Field {
  return {
    name: 'status',
    type: 'select',
    required: true,
    defaultValue: 'draft',
    options: [
      { label: '草稿', value: 'draft' },
      { label: '已發布', value: 'published' },
      { label: '已封存', value: 'archived' },
    ],
  };
}

/**
 * 共通 publish 欄位（publishedAt / scheduledAt）。
 */
export function buildPublishFields(): Field[] {
  return [
    { name: 'publishedAt', type: 'date' },
    { name: 'scheduledAt', type: 'date' },
  ];
}

/**
 * Block-driven layout field（吃 BLOCK_REGISTRY）。多語。
 */
export function buildLayoutField(): Field {
  return {
    name: 'layout',
    type: 'blocks',
    localized: true,
    blocks: buildPayloadBlocksFromRegistry(),
  };
}

export interface BlockDrivenCollectionOptions {
  /** Payload collection slug（如 'pages' / 'shop-pages'） */
  slug: string;
  /** admin 描述 */
  description?: string;
  /** defaultColumns admin 顯示 */
  defaultColumns?: string[];
  /** 額外 fields（插在 status 之前），常用於 relationship */
  extraFields?: Field[];
  /** 是否要 parent self-relationship（pages 用） */
  enableParent?: boolean;
  /** 是否要 isHomepage / sortOrder（pages 用） */
  enableHierarchy?: boolean;
}

/**
 * Block-driven collection factory。
 *
 * 共通結構：
 * - tenantId（多租戶）
 * - title / slug（多語 title）
 * - status + publishedAt + scheduledAt
 * - layout（blocks field，吃 BLOCK_REGISTRY）
 * - seo（group）
 * - versions + drafts（maxPerDoc: 50）
 *
 * 各 collection 透過 extraFields 加自家 relationship（product / course / categories）。
 */
export function buildBlockDrivenCollection(
  options: BlockDrivenCollectionOptions,
): CollectionConfig {
  const baseFields: Field[] = [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, index: true },
  ];

  if (options.enableParent) {
    baseFields.push({
      name: 'parent',
      type: 'relationship',
      relationTo: options.slug as CollectionSlug,
    });
  }
  if (options.enableHierarchy) {
    baseFields.push(
      { name: 'isHomepage', type: 'checkbox', defaultValue: false },
      { name: 'sortOrder', type: 'number', defaultValue: 0 },
    );
  }

  return {
    slug: options.slug,
    admin: {
      useAsTitle: 'title',
      defaultColumns: options.defaultColumns ?? ['title', 'slug', 'status'],
      description: options.description,
    },
    versions: { drafts: true, maxPerDoc: 50 },
    fields: [
      ...baseFields,
      ...(options.extraFields ?? []),
      buildStatusField(),
      ...buildPublishFields(),
      buildLayoutField(),
      buildSeoGroupField(),
    ],
    timestamps: true,
  };
}

/**
 * Pages collection 生成器。
 *
 * - layout：Payload `blocks` field，吃 BLOCK_REGISTRY 自動產生的 Block[]
 * - versions + drafts：開啟，最多保留 50 版
 * - SEO：group 包覆 9 個欄位
 * - 階層：parent (relationship → pages)，支援巢狀
 * - i18n：title / layout / seo.meta* 標記 localized
 */
export function buildPagesCollection(): CollectionConfig {
  return buildBlockDrivenCollection({
    slug: 'pages',
    description: '自訂頁面（layout 用 blocks-library + Zod schema）',
    defaultColumns: ['title', 'slug', 'status', 'isHomepage'],
    enableParent: true,
    enableHierarchy: true,
  });
}
