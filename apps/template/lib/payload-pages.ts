import 'server-only';

import { getPayload, type Where } from 'payload';

import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from './locale.js';

import type { BlockInstance, FrontendBlockKey } from '@saas-factory/factory-types';

/**
 * Payload 動態頁面結構（由各 SiteType 的 collection 提供）。
 *
 * 各 collection（pages / shop-pages / course-pages / blog-posts）共用本 shape，
 * BlockRenderer 直接消費 `page.blocks`。
 */
export interface PayloadPage {
  id: string | number;
  slug: string;
  title: string;
  blocks: BlockInstance[];
  /** SEO group（payload collection 內 seo 欄位） */
  seo?: PayloadSeo;
  /** 發布時間（已 publish 才有值） */
  publishedAt?: string;
}

export interface PayloadSeo {
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  ogImage?: unknown;
  ogTitle?: string;
  ogDescription?: string;
  noindex?: boolean;
  nofollow?: boolean;
  keywords?: Array<{ value?: string }>;
}

/**
 * Payload 對應的 SiteType collection slug。
 *
 * - `pages`：CMS / LP 共用。
 * - `shop-pages`：電商 landing / 主題頁。
 * - `course-pages`：課程介紹頁。
 * - `posts`：部落格文章（cms-blog PostsCollection，block-driven layout + rich text content 並存）。
 */
export type PayloadCollection = 'pages' | 'shop-pages' | 'course-pages' | 'posts';

/**
 * Payload `blocks` field 一個 doc 的 shape。
 *
 * Payload 序列化：`{id?: string, blockType: string, blockName?: string, ...fields}`。
 * 我們對齊 BlockInstance 把它扁平化的 fields 放回 config。
 */
export interface PayloadBlockDoc {
  id?: string;
  blockType: string;
  blockName?: string;
  variant?: string;
  visible?: boolean;
  [key: string]: unknown;
}

/**
 * Payload `seo` group field shape。
 *
 * Payload 序列化：`{metaTitle?, metaDescription?, ...}`。
 * 我們對齊 PayloadSeo 把它扁平化的 fields 放回 page.seo。
 */
const PAYLOAD_INTRINSIC_KEYS = new Set(['id', 'blockType', 'blockName', 'variant', 'visible']);

/**
 * 把 Payload `blocks` field 回傳的 doc 陣列轉成 BlockInstance[]。
 *
 * 規則：
 * - `type` ← `blockType`
 * - `variant` ← `variant` 欄位，預設 'default'
 * - `visible` ← `visible` 欄位，預設 true
 * - `order` ← 陣列 index（Payload `blocks` 維持插入順序）
 * - `config` ← 其餘 fields（剔除 id / blockType / blockName / variant / visible）
 */
export function mapPayloadLayoutToBlocks(
  layout: readonly PayloadBlockDoc[] | null | undefined,
): BlockInstance[] {
  if (!layout) return [];
  return layout.map((doc, index) => {
    const config: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(doc)) {
      if (!PAYLOAD_INTRINSIC_KEYS.has(key)) {
        config[key] = value;
      }
    }
    return {
      id: doc.id ?? `block-${index}`,
      type: doc.blockType as FrontendBlockKey,
      variant: doc.variant ?? 'default',
      config,
      visible: doc.visible ?? true,
      order: index,
    };
  });
}

export interface LoadPageOptions {
  /** 語系（對齊 Payload localization）。未指定走 DEFAULT_LOCALE。 */
  locale?: string;
  /** 取 draft 版本（後台預覽用）。預設 false 僅取 published。 */
  draft?: boolean;
}

/**
 * 依 collection + slug 撈頁面，回傳 BlockRenderer 可直接消費的 shape。
 *
 * - locale 對齊 Payload localization；未支援者 fallback DEFAULT_LOCALE
 * - draft = false 時加上 status === 'published' 條件
 * - 找不到回 null（呼叫端 notFound()）
 *
 * @example
 * const page = await loadPageBySlug('pages', 'about', { locale: 'zh-TW' });
 * if (!page) notFound();
 * return <BlockRenderer blocks={page.blocks} />;
 */
export async function loadPageBySlug(
  collection: PayloadCollection,
  slug: string,
  options: LoadPageOptions = {},
): Promise<PayloadPage | null> {
  const locale: Locale =
    options.locale && isSupportedLocale(options.locale) ? options.locale : DEFAULT_LOCALE;

  // 動態載入 payload config，避免 client bundle 拉進 server-only 模組
  const { default: config } = await import('@payload-config');
  const payload = await getPayload({ config });

  const where: Where = { slug: { equals: slug } };
  if (!options.draft) {
    where.status = { equals: 'published' };
  }

  const result = await payload.find({
    collection,
    where,
    locale,
    limit: 1,
    draft: options.draft ?? false,
  });

  const doc = result.docs[0] as
    | {
        id: string | number;
        slug?: string;
        title?: string;
        layout?: PayloadBlockDoc[];
        seo?: PayloadSeo;
        publishedAt?: string;
      }
    | undefined;
  if (!doc) return null;

  return {
    id: doc.id,
    slug: doc.slug ?? slug,
    title: doc.title ?? '',
    blocks: mapPayloadLayoutToBlocks(doc.layout),
    seo: doc.seo,
    publishedAt: doc.publishedAt,
  };
}

/**
 * 撈當前 tenant / locale 的首頁（pages collection 內 isHomepage=true）。
 *
 * - 僅讀 published 版（非 draft）
 * - 若有多筆 isHomepage=true，取 sortOrder 最小者（後台理應只設一筆）
 * - 找不到回 null（呼叫端 fallback 至靜態 placeholder）
 *
 * @example
 * const home = await loadHomePage('zh-TW');
 * if (!home) return <Placeholder />;
 * return <BlockRenderer blocks={home.blocks} />;
 */
export async function loadHomePage(localeInput?: string): Promise<PayloadPage | null> {
  const locale: Locale =
    localeInput && isSupportedLocale(localeInput) ? localeInput : DEFAULT_LOCALE;

  const { default: config } = await import('@payload-config');
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: 'pages',
    where: {
      isHomepage: { equals: true },
      status: { equals: 'published' },
    },
    locale,
    limit: 1,
    sort: 'sortOrder',
    draft: false,
  });

  const doc = result.docs[0] as
    | {
        id: string | number;
        slug?: string;
        title?: string;
        layout?: PayloadBlockDoc[];
        seo?: PayloadSeo;
        publishedAt?: string;
      }
    | undefined;
  if (!doc) return null;

  return {
    id: doc.id,
    slug: doc.slug ?? '',
    title: doc.title ?? '',
    blocks: mapPayloadLayoutToBlocks(doc.layout),
    seo: doc.seo,
    publishedAt: doc.publishedAt,
  };
}
