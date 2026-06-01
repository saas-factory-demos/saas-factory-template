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
 * 判斷某陣列是否為「primitive 包裝陣列」——即 seed 端 isAllPrimitiveArray 把 `['a','b']`
 * 包成 `[{value:'a'},{value:'b'}]`（Payload 再補 `id`，存成 `[{id,value}]`）的形狀。
 *
 * 條件：非空、每個元素都是物件、key 只允許 `id` / `value`、且 `value` 為 primitive。
 * 這樣可避免誤判「真的物件陣列」（如 tiers / items，元素有多個 key）。
 */
function isValueWrappedArray(arr: unknown[]): boolean {
  if (arr.length === 0) return false;
  return arr.every((e) => {
    if (e === null || typeof e !== 'object' || Array.isArray(e)) return false;
    const keys = Object.keys(e as Record<string, unknown>);
    if (!keys.includes('value')) return false;
    if (!keys.every((k) => k === 'id' || k === 'value')) return false;
    const v = (e as Record<string, unknown>).value;
    return v === null || (typeof v !== 'object' && typeof v !== 'function');
  });
}

/**
 * 判斷物件是否為「Payload populate 後的 Media doc」。
 *
 * Payload 對 `upload relationTo: media` 欄位預設 depth=2 會 populate 成完整 media doc：
 * `{ id, url, alt, filename, mimeType, filesize, width, height, ... }`。
 * 條件：含 string 型別的 `url`（且非空）+ `id`（number / string）。
 *
 * 排除 false positive：純 `url` 字串值（如 cta.href / link.url）不是物件、不會誤判；
 * 真正的 link 物件（如 `{href, label, url}`）沒有 `id` → 也不會誤判。
 */
function isPopulatedMediaDoc(obj: Record<string, unknown>): boolean {
  if (typeof obj.url !== 'string' || obj.url.length === 0) return false;
  return typeof obj.id === 'number' || typeof obj.id === 'string';
}

/**
 * 還原 Payload populate 後的 media doc → wizard 正規 image asset shape `{src, alt}`。
 *
 * 為何要在讀取面做：所有 block component（gallery / hero / features / team / steps / tabs /
 * logo-cloud / content-section）都讀 `image.src`，但 Payload populate 回來的 media doc 用
 * `image.url`、沒有 `src`。沒這層還原，HTML 渲染出來的 `<img>` 全部沒有 `src` 屬性 → 整站破圖。
 *
 * 此函式深度遞迴處理巢狀（如 `items[].image`、`tiers[].iconImage`），與 seed/payload-seed 端
 * 把 `{src, alt}` 轉成 mediaId 互為鏡像。
 */
function normalizeMediaRefs(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(normalizeMediaRefs);
  if (val !== null && typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (isPopulatedMediaDoc(obj)) {
      return {
        src: obj.url,
        alt: typeof obj.alt === 'string' ? obj.alt : '',
      };
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = normalizeMediaRefs(v);
    return out;
  }
  return val;
}

/**
 * 還原 seed/zod-payload 對 primitive 陣列的 `{value}` 包裝，回到 wizard 正規 shape。
 *
 * 為何要在讀取面做：seed 端把 `['a','b']` 包成 `[{value}]` 以符合 Payload array field，
 * 但 block 元件吃的是 wizard 正規 shape（plain `['a','b']`）。少了這層反向還原，
 * 已 seed 的內容在 **靜態 prerender / 重新部署** 時會把 `{id,value}` 物件當成 React child
 * 直接 render，噴「Objects are not valid as a React child」整個 build 失敗。
 *
 * 深度遞迴處理巢狀（如 `tiers[].features`），與 seed 端遞迴 wrap 互為鏡像。
 */
function unwrapValueWrappers(val: unknown): unknown {
  if (Array.isArray(val)) {
    if (isValueWrappedArray(val)) {
      return val.map((e) => (e as { value: unknown }).value);
    }
    return val.map((e) => unwrapValueWrappers(e));
  }
  if (val !== null && typeof val === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      out[k] = unwrapValueWrappers(v);
    }
    return out;
  }
  return val;
}

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
        // 兩道還原（皆與 seed/payload-seed 互為鏡像）：
        // 1. populated media doc {id,url,alt,...} → {src, alt}（補 9 個 block component 都讀 .src）
        // 2. {value} 包裝陣列 → primitive[]（避免靜態 prerender 把物件當 React child）
        config[key] = unwrapValueWrappers(normalizeMediaRefs(value));
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
