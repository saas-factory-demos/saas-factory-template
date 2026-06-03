import type { BlockInstance, PageComposition } from '@saas-factory/factory-types';
import type { Payload } from 'payload';

/**
 * Payload `blocks` field 寫入 doc shape。
 *
 * 與讀取面 `PayloadBlockDoc`（lib/payload-pages.ts）互為鏡像：
 * - 我們序列化：type → blockType，config 攤平到頂層，加 variant / visible
 * - 讀取時：blockType → type，config 收回非 intrinsic key
 */
export interface PayloadBlockInput {
  id?: string;
  blockType: string;
  variant?: string;
  visible?: boolean;
  [key: string]: unknown;
}

/**
 * Payload pages.create 用的最小 payload shape。
 *
 * Payload localized 欄位（title / layout）寫入時若只給單值，
 * 預設寫到目前 locale；要多語請呼叫端拆兩次 create / update。
 */
export interface PayloadPageInput {
  tenantId: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  isHomepage?: boolean;
  sortOrder?: number;
  layout: PayloadBlockInput[];
}

/**
 * 把 BlockInstance（factory-types canonical shape）轉成 Payload blocks doc。
 *
 * 規則（與 mapPayloadLayoutToBlocks 鏡像）：
 * - blockType ← type
 * - variant / visible 直接保留
 * - config 物件「攤平」到頂層（Payload blocks field 沒有 nested config 概念）
 * - order 不寫入：Payload 用陣列 index 維持順序
 */
export function blockInstanceToPayloadBlock(block: BlockInstance): PayloadBlockInput {
  return {
    id: block.id,
    blockType: block.type,
    variant: block.variant,
    visible: block.visible,
    ...block.config,
  };
}

/**
 * 把 PageComposition[]（industry-templates 出）轉成 Payload pages.create 輸入陣列。
 *
 * 行為：
 * - pageKey 'homepage' → slug='home', isHomepage=true, sortOrder=0
 * - 其餘 pageKey → slug=pageKey, isHomepage=false, sortOrder=index
 * - title 用 pageKey humanize（kebab → Title Case）。實務上呼叫端應該覆寫多語版本
 * - status 全部 'published'（種子預設可見；測試環境想要 draft 自行覆寫）
 *
 * @param tenantId 多租戶 id（必填）
 * @param compositions 來自 IndustryTemplate.pages[siteType]
 */
export function pageCompositionsToPayloadPages(
  tenantId: string,
  compositions: readonly PageComposition[],
): PayloadPageInput[] {
  return compositions.map((comp, index) => {
    const isHome = comp.pageKey === 'homepage';
    return {
      tenantId,
      title: humanizePageKey(comp.pageKey),
      slug: isHome ? 'home' : comp.pageKey,
      status: 'published',
      isHomepage: isHome,
      sortOrder: isHome ? 0 : index,
      layout: comp.blocks
        .slice()
        .sort((a, b) => a.order - b.order)
        .map(blockInstanceToPayloadBlock),
    };
  });
}

/**
 * Payload block intrinsic keys（不參與 transform；維持原值）。
 */
const PAYLOAD_BLOCK_INTRINSICS = new Set(['id', 'blockType', 'variant', 'visible']);

/**
 * 1×1 透明 PNG（67 byte），用於把 fixture image asset 映射到 Payload Media 占位記錄。
 *
 * 為何不抓真實圖：seed 流程不依賴外部 HTTP（picsum / unsplash）即可離線跑、無 flake；
 * 後台 admin 可自行替換為真實圖檔。視覺差距由文字 + layout 撐住，圖檔留給客戶填。
 */
const PLACEHOLDER_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/**
 * Per-tenant placeholder media 快取。第一次遇到 image asset 才呼叫 payload.create，
 * 之後同 tenant 內所有 image 共用同一筆 media doc id（demo 站夠用；客戶要不同圖請改 admin）。
 *
 * **為何存 in-flight promise 而非已解析 id**：seed 流程用 `Promise.all` 並發轉換多個 block，
 * 同一頁多張 image asset 會「同時」呼叫 ensurePlaceholderMediaId。若快取存的是 resolved id，
 * 並發呼叫者在第一筆 create 完成前都看到 `null` → 各自 create 一筆 media，撞 Media collection
 * `filename` 的 `unique: true`（皆 `placeholder-<tenant>.png`），Payload 噴
 * 「The following field is invalid: filename」。改存 promise 後，第一個呼叫者「同步」把 in-flight
 * promise 寫進快取，後續並發呼叫者拿到同一個 promise，只會 create 一次。
 *
 * （本地 staticDir 模式下 Payload 的 getSafeFileName 會掃本地檔做去重而意外遮蔽此 race；
 * R2 storage plugin 設 disableLocalStorage:true 後遮蔽消失，race 才浮現。）
 */
export interface PlaceholderMediaCache {
  current: Promise<number | string> | null;
}

export function createPlaceholderMediaCache(): PlaceholderMediaCache {
  return { current: null };
}

/**
 * 偵測「圖片資產」shape — 與 zod-payload adapter `isImageAssetShape` 規則一致：
 * 必含 src + alt；其餘 key 只允許 width / height。
 *
 * 這是把 fixture `{ src, alt }` 對應到 Payload `upload relationTo: 'media'` 欄位的關鍵；
 * Payload upload 欄位收 plain object 會噴 "field is invalid"，必須換成 media doc id。
 *
 * `mediaId` 為選用：generator `generate-images` step 會先把真實圖 ingest 成 Media doc，
 * 再把 doc id 回填到 asset 物件（見 transformValueForPayload）；故 allowed 含 `mediaId`。
 */
function isImageAssetShape(obj: Record<string, unknown>): boolean {
  const keys = Object.keys(obj);
  if (!keys.includes('src') || !keys.includes('alt')) return false;
  const allowed = new Set(['src', 'alt', 'width', 'height', 'mediaId']);
  return keys.every((k) => allowed.has(k));
}

/**
 * 判斷 array 是否「全為 primitive」（含 null）。對應 zod-payload adapter：
 * `z.array(z.string())` 之類會被 wrap 成 Payload `array` field 含單一 `value` 欄位。
 * fixture 寫 `['a', 'b']`，Payload 期待 `[{value:'a'}, {value:'b'}]`；不轉就噴
 * "Cannot create property 'value' on string 'a'"。
 */
function isAllPrimitiveArray(val: unknown[]): boolean {
  return val.every(
    (e) => e === null || (typeof e !== 'object' && typeof e !== 'function'),
  );
}

/**
 * 首次遇到 image asset 時上傳一張 1×1 placeholder PNG 到 Media collection，
 * 回傳 doc id；之後同 tenant 直接 reuse cache。
 *
 * 並發安全：第一個呼叫者「同步」把 in-flight promise 寫入 cache（check 與 assign 之間無 await），
 * 因此 Promise.all 並發轉換時不會有兩個呼叫者同時看到 `null` 而各自 create。
 * create 失敗時把 cache 歸零，讓後續 asset 仍有機會重試（不毒化整批 seed）。
 */
async function ensurePlaceholderMediaId(
  payload: Payload,
  tenantId: string,
  asset: Record<string, unknown>,
  cache: PlaceholderMediaCache,
): Promise<number | string> {
  if (cache.current === null) {
    cache.current = createPlaceholderMedia(payload, tenantId, asset).catch((err: unknown) => {
      cache.current = null;
      throw err;
    });
  }
  return cache.current;
}

/**
 * 實際上傳 placeholder PNG 並回傳 media doc id。獨立出來讓 ensurePlaceholderMediaId
 * 能同步取得未完成的 promise（async 函式呼叫即同步回傳 promise）。
 */
async function createPlaceholderMedia(
  payload: Payload,
  tenantId: string,
  asset: Record<string, unknown>,
): Promise<number | string> {
  const buf = Buffer.from(PLACEHOLDER_PNG_BASE64, 'base64');
  const altText = typeof asset.alt === 'string' && asset.alt.length > 0 ? asset.alt : '占位圖';
  /* Payload Media collection 預設 schema 由模板宣告；alt 是 required text。
   * 型別層用 cast 跳過：Media data 形狀依各客戶 collection 而異。 */
  const doc = (await payload.create({
    collection: 'media',
    data: { alt: altText } as Record<string, unknown> as never,
    file: {
      data: buf,
      mimetype: 'image/png',
      name: `placeholder-${tenantId}.png`,
      size: buf.length,
    },
  })) as { id: number | string };
  return doc.id;
}

/**
 * 遞迴 transform：陣列 / 物件 / image asset 三條規則一次處理。
 *
 * 規則：
 * - null / undefined / primitive → 原樣回
 * - array：全 primitive 就 wrap 成 `[{value:x}]`；否則遞迴每個元素
 * - object：是 imageAsset shape →
 *     - 已帶 `mediaId`（generate-images 預先 ingest 的真實圖）→ 直接用該 id
 *     - 否則 → 上傳共用 1×1 placeholder 換 media id
 *   其餘 → 遞迴每個 key
 *
 * 為何不在 zod-payload 層做反向 transform：那一層只負責 schema → field
 * 定義；inbound data 是 seed-time 才知道，不適合掛在 schema 上。
 */
export async function transformValueForPayload(
  payload: Payload,
  tenantId: string,
  val: unknown,
  cache: PlaceholderMediaCache,
): Promise<unknown> {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) {
    if (val.length > 0 && isAllPrimitiveArray(val)) {
      return val.map((e) => ({ value: e }));
    }
    return await Promise.all(
      val.map((e) => transformValueForPayload(payload, tenantId, e, cache)),
    );
  }
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if (isImageAssetShape(obj)) {
      // generate-images 已預先 ingest 真實圖並回填 mediaId → 直接用，不建 placeholder
      if (typeof obj.mediaId === 'number' || typeof obj.mediaId === 'string') {
        return obj.mediaId;
      }
      return await ensurePlaceholderMediaId(payload, tenantId, obj, cache);
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = await transformValueForPayload(payload, tenantId, v, cache);
    }
    return out;
  }
  return val;
}

/**
 * Payload block 物件（已攤平 config）→ 把所有 non-intrinsic 欄位跑過 transform。
 *
 * INTRINSIC（id / blockType / variant / visible）原樣保留；其餘 key 是 block.config
 * 攤平來的內容欄位，需經 transformValueForPayload 對齊 Payload field shape。
 */
export async function transformPayloadBlockForPayload(
  payload: Payload,
  tenantId: string,
  block: PayloadBlockInput,
  cache: PlaceholderMediaCache,
): Promise<PayloadBlockInput> {
  const out: PayloadBlockInput = { blockType: block.blockType };
  for (const [k, v] of Object.entries(block)) {
    if (PAYLOAD_BLOCK_INTRINSICS.has(k)) {
      out[k] = v;
    } else {
      out[k] = await transformValueForPayload(payload, tenantId, v, cache);
    }
  }
  return out;
}

/**
 * 'product-list' → 'Product List'。
 */
function humanizePageKey(key: string): string {
  return key
    .split('-')
    .map((part) => (part.length === 0 ? part : part[0]!.toUpperCase() + part.slice(1)))
    .join(' ');
}
